
import os
import mimetypes
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services import scanner, library
from app.models.music import Track, Album

router = APIRouter()

@router.post("/scan")
def scan_music_library(directory: Optional[str] = None, db: Session = Depends(get_db)):
    result = scanner.scan_library(db, directory)
    return result

@router.get("/search")
def search_tracks(q: str, limit: int = 50, db: Session = Depends(get_db)):
    results = library.search(db, q, limit)
    return [
        {
            "id": t.id,
            "title": t.title,
            "artist": t.artist.name,
            "album": t.album.title,
            "duration": t.duration,
            "album_id": t.album_id,
            "has_cover": bool(t.album.cover_image_path and os.path.exists(t.album.cover_image_path))
        } for t in results
    ]

@router.get("/stream/{track_id}")
async def stream_track(
    track_id: int, 
    request: Request, 
    db: Session = Depends(get_db)
):
    file_path = library.get_track_file(db, track_id)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Track file not found")

    file_size = os.path.getsize(file_path)
    range_header = request.headers.get("range")

    content_type, _ = mimetypes.guess_type(file_path)
    if not content_type:
        content_type = "application/octet-stream"
    if not range_header:
        def iterfile():  
            with open(file_path, mode="rb") as file_like:  
                yield from file_like  
        return StreamingResponse(iterfile(), media_type=content_type)

    try:
        start, end = range_header.replace("bytes=", "").split("-")
        start = int(start)
        end = int(end) if end else file_size - 1
    except ValueError:
        start = 0
        end = file_size - 1

    chunk_size = 1024 * 1024
    
    def iterfile_range():
        with open(file_path, "rb") as f:
            f.seek(start)
            bytes_to_read = end - start + 1
            while bytes_to_read > 0:
                chunk = f.read(min(chunk_size, bytes_to_read))
                if not chunk:
                    break
                yield chunk
                bytes_to_read -= len(chunk)

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(end - start + 1),
    }

    return StreamingResponse(
        iterfile_range(), 
        status_code=206, 
        headers=headers, 
        media_type=content_type
    )

@router.get("/cover/{album_id}")
def get_album_cover(album_id: int, db: Session = Depends(get_db)):
    cover_path = library.get_album_cover_path(db, album_id)
    if cover_path and os.path.exists(cover_path):
        return FileResponse(
            cover_path,
            headers={"Cache-Control": "public, max-age=604800"}  # 1 week cache
        )
    
    raise HTTPException(status_code=404, detail="Cover art not found")

@router.get("/track-cover/{track_id}")
def get_track_embedded_cover(track_id: int, db: Session = Depends(get_db)):
    from mutagen import File as MutagenFile
    from mutagen.flac import FLAC
    from mutagen.mp3 import MP3
    from mutagen.id3 import ID3
    from io import BytesIO
    from fastapi.responses import Response
    
    file_path = library.get_track_file(db, track_id)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Track not found")
    
    try:
        audio = MutagenFile(file_path)
        cover_data = None
        mime_type = "image/jpeg"
        
        if file_path.lower().endswith('.flac'):
            flac = FLAC(file_path)
            if flac.pictures:
                cover_data = flac.pictures[0].data
                mime_type = flac.pictures[0].mime
        elif file_path.lower().endswith('.mp3'):
            try:
                tags = ID3(file_path)
                for key in tags.keys():
                    if key.startswith('APIC'):
                        cover_data = tags[key].data
                        mime_type = tags[key].mime
                        break
            except:
                pass
        
        if cover_data:
            return Response(
                content=cover_data, 
                media_type=mime_type,
                headers={"Cache-Control": "public, max-age=604800"}  # 1 week cache
            )
    except Exception as e:
        pass
    
    raise HTTPException(status_code=404, detail="No embedded cover art")


@router.get("/favorites")
def get_favorites(db: Session = Depends(get_db)):
    from app.models.music import Favorite, Track, Artist, Album
    
    favorites = db.query(Favorite).order_by(Favorite.added_at.desc()).all()
    result = []
    for fav in favorites:
        track = fav.track
        if track:
            album = track.album
            artist = track.artist
            result.append({
                "id": track.id,
                "title": track.title,
                "artist": artist.name if artist else "Bilinmeyen",
                "album_id": album.id if album else None,
                "album_title": album.title if album else None,
                "duration": track.duration,
                "has_cover": album.cover_image_path is not None if album else False,
                "added_at": fav.added_at.isoformat() if fav.added_at else None
            })
    return result


@router.post("/favorites/{track_id}")
def add_favorite(track_id: int, db: Session = Depends(get_db)):
    from app.models.music import Favorite, Track
    from datetime import datetime
    
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    existing = db.query(Favorite).filter(Favorite.track_id == track_id).first()
    if existing:
        return {"message": "Already favorited", "track_id": track_id}
    
    favorite = Favorite(track_id=track_id, added_at=datetime.utcnow())
    db.add(favorite)
    db.commit()
    return {"message": "Added to favorites", "track_id": track_id}


@router.delete("/favorites/{track_id}")
def remove_favorite(track_id: int, db: Session = Depends(get_db)):
    from app.models.music import Favorite
    
    favorite = db.query(Favorite).filter(Favorite.track_id == track_id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Not in favorites")
    
    db.delete(favorite)
    db.commit()
    return {"message": "Removed from favorites", "track_id": track_id}


@router.get("/playlists")
def get_playlists(db: Session = Depends(get_db)):
    from app.models.music import Playlist, PlaylistTrack
    
    playlists = db.query(Playlist).order_by(Playlist.created_at.desc()).all()
    result = []
    for pl in playlists:
        result.append({
            "id": pl.id,
            "name": pl.name,
            "track_count": len(pl.tracks),
            "created_at": pl.created_at.isoformat() if pl.created_at else None
        })
    return result


@router.post("/playlists")
def create_playlist(name: str, db: Session = Depends(get_db)):
    from app.models.music import Playlist
    from datetime import datetime
    
    playlist = Playlist(name=name, created_at=datetime.utcnow())
    db.add(playlist)
    db.commit()
    db.refresh(playlist)
    return {"id": playlist.id, "name": playlist.name}


@router.get("/playlists/{playlist_id}")
def get_playlist(playlist_id: int, db: Session = Depends(get_db)):
    from app.models.music import Playlist, PlaylistTrack, Track, Artist, Album
    
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    tracks = []
    for pt in playlist.tracks:
        track = pt.track
        if track:
            artist = track.artist
            album = track.album
            tracks.append({
                "id": track.id,
                "title": track.title,
                "artist": artist.name if artist else "Bilinmeyen",
                "album_id": album.id if album else None,
                "duration": track.duration,
                "has_cover": album.cover_image_path is not None if album else False,
                "position": pt.position
            })
    
    return {
        "id": playlist.id,
        "name": playlist.name,
        "tracks": tracks,
        "created_at": playlist.created_at.isoformat() if playlist.created_at else None
    }


@router.post("/playlists/{playlist_id}/tracks/{track_id}")
def add_track_to_playlist(playlist_id: int, track_id: int, db: Session = Depends(get_db)):
    from app.models.music import Playlist, PlaylistTrack, Track
    from datetime import datetime
    
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    existing = db.query(PlaylistTrack).filter(
        PlaylistTrack.playlist_id == playlist_id,
        PlaylistTrack.track_id == track_id
    ).first()
    if existing:
        return {"message": "Track already in playlist"}
    
    max_pos = db.query(PlaylistTrack).filter(PlaylistTrack.playlist_id == playlist_id).count()
    
    pt = PlaylistTrack(
        playlist_id=playlist_id,
        track_id=track_id,
        position=max_pos,
        added_at=datetime.utcnow()
    )
    db.add(pt)
    db.commit()
    return {"message": "Track added to playlist"}


@router.delete("/playlists/{playlist_id}/tracks/{track_id}")
def remove_track_from_playlist(playlist_id: int, track_id: int, db: Session = Depends(get_db)):
    from app.models.music import PlaylistTrack
    
    pt = db.query(PlaylistTrack).filter(
        PlaylistTrack.playlist_id == playlist_id,
        PlaylistTrack.track_id == track_id
    ).first()
    if not pt:
        raise HTTPException(status_code=404, detail="Track not in playlist")
    
    db.delete(pt)
    db.commit()
    return {"message": "Track removed from playlist"}


@router.delete("/playlists/{playlist_id}")
def delete_playlist(playlist_id: int, db: Session = Depends(get_db)):
    from app.models.music import Playlist
    
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    db.delete(playlist)
    db.commit()
    return {"message": "Playlist deleted"}


@router.get("/lyrics")
def get_lyrics(
    artist_name: str, 
    track_name: str, 
    album_name: Optional[str] = None, 
    duration: Optional[float] = None
):
    import requests
    
    url = "https://lrclib.net/api/get"
    params = {
        "artist_name": artist_name,
        "track_name": track_name,
    }
    if album_name:
        params["album_name"] = album_name
    if duration:
        params["duration"] = duration
        
    headers = {
        "User-Agent": "TsukuyomiMusicPlayer/1.0 (https://github.com/ewgsta/tsukuyomi)"
    }
        
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            raise HTTPException(status_code=404, detail="Lyrics not found")
        else:
            # Try search if direct get fails
            search_url = "https://lrclib.net/api/search"
            # Remove duration for search as it might be too strict
            search_params = params.copy()
            if "duration" in search_params:
                del search_params["duration"]
            
            search_res = requests.get(search_url, params=search_params, headers=headers, timeout=10)
            if search_res.status_code == 200:
                data = search_res.json()
                if data and len(data) > 0:
                    return data[0]
            
            raise HTTPException(status_code=404, detail="Lyrics not found")
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Lyrics fetch error: {e}")
        # Return 404 instead of 500 when lyrics are just missing or connection fails, 
        # so the UI doesn't look broken.
        raise HTTPException(status_code=404, detail="Lyrics unavailable")
