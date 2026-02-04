
from sqlalchemy.orm import Session
from app.models.music import Track, Album, Artist
from rapidfuzz import process, fuzz

def search(db: Session, query: str, limit: int = 50):
    query_str = query.strip()
    if not query_str:
        return []

    sql_results = db.query(Track).join(Artist).join(Album).filter(
        (Track.title.ilike(f"%{query_str}%")) |
        (Artist.name.ilike(f"%{query_str}%")) |
        (Album.title.ilike(f"%{query_str}%"))
    ).all()
    
    found_ids = {t.id for t in sql_results}
    final_results = list(sql_results)
    
    if len(final_results) < limit:
        all_tracks = db.query(Track).join(Artist).all()
        
        candidates = {t.id: f"{t.artist.name} {t.title} {t.album.title or ''}" for t in all_tracks if t.id not in found_ids}
        
        if candidates:
            fuzzy_results = process.extract(
                query_str, 
                candidates, 
                limit=limit - len(final_results), 
                scorer=fuzz.token_set_ratio
            )
            
            fuzzy_matched_ids = [res[2] for res in fuzzy_results if res[1] > 60]
            
            track_map = {t.id: t for t in all_tracks}
            for mid in fuzzy_matched_ids:
                if mid in track_map:
                    final_results.append(track_map[mid])

    return final_results[:limit]

def get_track_file(db: Session, track_id: int):
    track = db.query(Track).filter(Track.id == track_id).first()
    if track:
        return track.file_path
    return None

def get_album_cover_path(db: Session, album_id: int):
    album = db.query(Album).filter(Album.id == album_id).first()
    if album and album.cover_image_path:
        return album.cover_image_path
    return None
