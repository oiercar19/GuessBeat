from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import crud
from app.services.soundcloud import search_tracks

router = APIRouter()

games = {}

@router.get("/start")
def start_game(category: int = Query(..., description="ID de la categoría"), db: Session = Depends(get_db)):
    """Selecciona una canción aleatoria desde la DB y obtiene su stream de SoundCloud."""
    song = crud.get_random_song_by_category(db, category)
    if not song:
        return {"error": "No hay canciones en esta categoría"}

    results = search_tracks(song.title)
    if not results:
        return {"error": f"No se encontró '{song.title}' en SoundCloud"}

    sc_track = results[0]
    return {
        "title": song.title,
        "artist": song.artist or sc_track["artist"],
        "release_year": song.release_year,
        "artwork": sc_track["artwork"],
        "permalink_url": sc_track["permalink_url"],
    }


@router.get("/fragment/{game_id}")
def get_fragment(game_id: str, index: int = 0):
    """Devuelve el fragmento correspondiente de la partida"""
    if game_id not in games:
        return {"error": "Partida no encontrada"}

    game = games[game_id]
    fragments = game["fragments"]
    index = min(index, len(fragments) - 1)
    length = fragments[index]

    return {
        "stream_url": f"{game['track']['stream_url']}#t=0",
        "fragment_length": length,
        "index": index,
    }


@router.get("/search")
def search_song(query: str):
    """Búsqueda refinada: evita remixes, versiones y duplica si el artista coincide."""
    results = search_tracks(query, limit=15)
    if not results:
        return []

    filtered = []
    seen_titles = set()

    for r in results:
        title = r["title"].lower()
        artist = r["artist"].lower() if r.get("artist") else ""

        # Ignorar palabras no deseadas
        if any(bad in title for bad in ["remix", "mix", "edit", "version", "live", "bootleg", "cover", "karaoke", "instrumental", "demo", "tribute", "acoustic", "original", "rework", "dubstep", "extended", "radio"]):
            continue

        # Evitar duplicados
        base = title.split(" - ")[0].strip()
        if base in seen_titles:
            continue
        seen_titles.add(base)

        # Priorizar coincidencia con el artista (si existe)
        if query.lower() in title or query.lower() in artist:
            filtered.append(r)

    # Si no hay suficientes, devuelve lo que haya
    return filtered[:5]



@router.post("/check")
def check_guess(title: str = Query(...), guess: str = Query(...)):
    """
    Comprueba si el jugador ha adivinado la canción.
    Ignora mayúsculas/minúsculas, espacios extra y guiones del tipo ' - '.
    """
    # Normalizar textos (todo minúsculas, sin espacios extra)
    title_clean = title.lower().strip()
    guess_clean = guess.lower().strip()

    # Si el título contiene un " - ", nos quedamos solo con la parte antes del guion
    if " - " in title_clean:
        title_clean = title_clean.split(" - ")[0].strip()

    # Eliminar también cualquier texto entre paréntesis (versiones, remixes, etc.)
    import re
    title_clean = re.sub(r"\(.*?\)", "", title_clean).strip()

    # Comprobación flexible
    if guess_clean in title_clean or title_clean in guess_clean:
        return {"correct": True, "title": title}
    
    return {"correct": False}
