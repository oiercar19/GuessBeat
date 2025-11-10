import random
from sqlalchemy.orm import Session
from app.db import models

def get_categories(db: Session):
    return db.query(models.Category).all()

def get_random_song_by_category(db: Session, category_id: int):
    songs = db.query(models.Song).filter(models.Song.category_id == category_id).all()
    return random.choice(songs) if songs else None

def add_default_data(db: Session):
    """Inserta categorías y canciones iniciales si no existen."""
    if db.query(models.Category).count() > 0:
        return

    categories = [
        models.Category(name="🎤 Música en Español", description="Éxitos en español"),
        models.Category(name="🎸 Rock", description="Clásicos del rock"),
        models.Category(name="🕺 70s y 80s", description="Temazos de las décadas doradas"),
    ]
    db.add_all(categories)
    db.commit()

    songs_data = [
        # Español
        {"title": "La Flaca", "artist": "Jarabe de Palo", "release_year": "1996", "category_id": 1},
        {"title": "Corazón Partío", "artist": "Alejandro Sanz", "release_year": "1997", "category_id": 1},

        # Rock
        {"title": "Smells Like Teen Spirit", "artist": "Nirvana", "release_year": "1991", "category_id": 2},
        {"title": "Bohemian Rhapsody", "artist": "Queen", "release_year": "1975", "category_id": 2},

        # 70s y 80s
        {"title": "Billie Jean", "artist": "Michael Jackson", "release_year": "1982", "category_id": 3},
        {"title": "Stayin' Alive", "artist": "Bee Gees", "release_year": "1977", "category_id": 3},
    ]

    db.add_all([models.Song(**s) for s in songs_data])
    db.commit()
