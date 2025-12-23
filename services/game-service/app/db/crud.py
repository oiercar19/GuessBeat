import random
from sqlalchemy.orm import Session
from app.db import models

def get_categories(db: Session):
    return db.query(models.Category).all()

def get_random_song_by_category(db: Session, category_id: int, exclude_ids: list = None):
    query = db.query(models.Song).filter(models.Song.category_id == category_id)
    
    if exclude_ids:
        songs_excluded = query.filter(models.Song.id.notin_(exclude_ids)).all()
        # Si quedan canciones después de excluir, usar esas
        if songs_excluded:
            return random.choice(songs_excluded)
    
    all_songs = query.all()
    return random.choice(all_songs) if all_songs else None

def add_song(db: Session, title: str, artist: str, release_year: str, category_id: int, permalink_url: str = None, artwork: str = None):
    song = models.Song(
        title=title,
        artist=artist,
        release_year=release_year,
        category_id=category_id,
        permalink_url=permalink_url,
        artwork=artwork
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    return song

def add_default_data(db: Session):
    if db.query(models.Category).count() > 0:
        return

    categories = [
        models.Category(name="🎤 Música en Español", description="Éxitos en español"),
        models.Category(name="📅 Adivina el Año", description="¿En qué año salió esta canción?"),
        models.Category(name="🕺 70s y 80s", description="Temazos de las décadas doradas"),
    ]
    db.add_all(categories)
    db.commit()

    songs_data = [
        # Español
        {"title": "La Flaca", "artist": "Jarabe de Palo", "release_year": "1996", "category_id": 1},
        {"title": "Corazón Partío", "artist": "Alejandro Sanz", "release_year": "1997", "category_id": 1},

        # Adivina el Año
        {"title": "Smells Like Teen Spirit", "artist": "Nirvana", "release_year": "1991", "category_id": 2},
        {"title": "Bohemian Rhapsody", "artist": "Queen", "release_year": "1975", "category_id": 2},
        {"title": "Thriller", "artist": "Michael Jackson", "release_year": "1982", "category_id": 2},
        {"title": "Hotel California", "artist": "Eagles", "release_year": "1976", "category_id": 2},
        {"title": "Sweet Child O' Mine", "artist": "Guns N' Roses", "release_year": "1987", "category_id": 2},
        {"title": "Wonderwall", "artist": "Oasis", "release_year": "1995", "category_id": 2},

        # 70s y 80s
        {"title": "Billie Jean", "artist": "Michael Jackson", "release_year": "1982", "category_id": 3},
        {"title": "Stayin' Alive", "artist": "Bee Gees", "release_year": "1977", "category_id": 3},
    ]

    db.add_all([models.Song(**s) for s in songs_data])
    db.commit()
