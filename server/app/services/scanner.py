
import os
import mutagen
from sqlalchemy.orm import Session
from app.models.music import Artist, Album, Track
from app.core.config import settings
from mutagen.easyid3 import EasyID3
from mutagen.flac import FLAC

# ses formatları bunlar yeter glb
SUPPORTED_EXTENSIONS = {'.mp3', '.flac', '.wav', '.m4a', '.ogg'}

def scan_library(db: Session, directory: str = None):
    root_dir = directory or settings.MUSIC_DIRECTORY
    if not os.path.exists(root_dir):
        print(f"Directory not found: {root_dir}")
        return {"status": "error", "message": "Directory not found"}

    scan_count = 0
    
    for root, dirs, files in os.walk(root_dir):
        cover_image = None
        for img in ['cover.jpg', 'album.jpg']:
            if img in files:
                cover_image = os.path.join(root, img)
                break

        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in SUPPORTED_EXTENSIONS:
                file_path = os.path.join(root, file)
                
                existing_track = db.query(Track).filter(Track.file_path == file_path).first()
                if existing_track:
                    continue
                
                try:
                    process_file(db, file_path, cover_image)
                    scan_count += 1
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

    db.commit()
    return {"status": "success", "added_tracks": scan_count}

def process_file(db: Session, file_path: str, folder_cover_path: str = None):
    try:
        audio = mutagen.File(file_path, easy=True)
        if not audio:
            return

        artist_name = audio.get('artist', ['Belirsiz Sanatçı'])[0]
        album_title = audio.get('album', ['Belirsiz Albüm'])[0]
        title = audio.get('title', [os.path.basename(file_path)])[0]
        date = audio.get('date', [''])[0]
        genre = audio.get('genre', [''])[0]
        track_number = audio.get('tracknumber', ['0'])[0]
        
        try:
            track_num = int(track_number.split('/')[0]) if '/' in track_number else int(track_number)
        except:
            track_num = 0
            
        duration = audio.info.length if audio.info else 0

        artist = db.query(Artist).filter(Artist.name == artist_name).first()
        if not artist:
            artist = Artist(name=artist_name)
            db.add(artist)
            db.flush()

        album = db.query(Album).filter(Album.title == album_title, Album.artist_id == artist.id).first()
        if not album:
            album = Album(title=album_title, artist_id=artist.id, year=date, cover_image_path=folder_cover_path)
            db.add(album)
            db.flush()
        
        if album and not album.cover_image_path and folder_cover_path:
             album.cover_image_path = folder_cover_path

        track = Track(
            title=title,
            file_path=file_path,
            duration=duration,
            track_number=track_num,
            genre=genre,
            album_id=album.id,
            artist_id=artist.id
        )
        db.add(track)
        db.commit() 
        
    except Exception as e:
        print(f"Failed to read metadata for {file_path}: {e}")

def remove_file(db: Session, file_path: str):
    track = db.query(Track).filter(Track.file_path == file_path).first()
    if track:
        db.delete(track)
        db.commit()
        print(f"Removed track: {file_path}")


