
import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from app.core.config import settings
from app.services import scanner
from app.db.session import SessionLocal

class MusicHandler(FileSystemEventHandler):
    def __init__(self):
        self.supported_extensions = scanner.SUPPORTED_EXTENSIONS

    def _is_music_file(self, path):
        _, ext = os.path.splitext(path)
        return ext.lower() in self.supported_extensions

    def on_created(self, event):
        if not event.is_directory and self._is_music_file(event.src_path):
            print(f"New file detected: {event.src_path}")
            db = SessionLocal()
            try:
                scanner.process_file(db, event.src_path)
            finally:
                db.close()

    def on_deleted(self, event):
        if not event.is_directory and self._is_music_file(event.src_path):
            print(f"File deleted: {event.src_path}")
            db = SessionLocal()
            try:
                scanner.remove_file(db, event.src_path)
            finally:
                db.close()

    def on_moved(self, event):
        if not event.is_directory and self._is_music_file(event.src_path):
            print(f"File moved: {event.src_path} -> {event.dest_path}")
            db = SessionLocal()
            try:
                scanner.remove_file(db, event.src_path)
                if self._is_music_file(event.dest_path):
                    scanner.process_file(db, event.dest_path)
            finally:
                db.close()
                
    def on_modified(self, event):
        if not event.is_directory and self._is_music_file(event.src_path):
             
             pass 

observer = Observer()

def start_watcher():
    if not os.path.exists(settings.MUSIC_DIRECTORY):
        print(f"Music directory not found: {settings.MUSIC_DIRECTORY}. Watcher not started.")
        return

    event_handler = MusicHandler()
    observer.schedule(event_handler, settings.MUSIC_DIRECTORY, recursive=True)
    observer.start()
    print(f"Watcher started on {settings.MUSIC_DIRECTORY}")

def stop_watcher():
    observer.stop()
    observer.join()
    print("Watcher stopped")
