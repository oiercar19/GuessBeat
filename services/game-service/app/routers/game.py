from fastapi import APIRouter, Query
from app.services.soundcloud import search_tracks
import random

router = APIRouter()

# 🎮 Estado de las partidas (en memoria)
games = {}

@router.get("/start")
def start_game(category: str = Query(..., description="Categoría")):
    songs = search_tracks(category)
    if not songs:
        return {"error": "No se encontraron canciones para esta categoría"}

    song = random.choice(songs)
    game_id = str(random.randint(1000, 9999))

    games[game_id] = {
        "track": song,
        "fragments": [5, 10, 15, 20, 25],
        "current_fragment": 0,
        "guessed": False,
    }

    return {
        "game_id": game_id,
        "track_id": song["id"],
        "title": song["title"],
        "artist": song["artist"],
        "artwork": song["artwork"],
        "category": category,
        "permalink_url": song["permalink_url"],
        "release_year": song.get("release_year", "Desconocido")

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
    """Permite buscar canciones (para autocompletar en el frontend)"""
    results = search_tracks(query, limit=5)
    return results


@router.post("/check")
def check_guess(game_id: str, guess: str):
    """Comprueba si el jugador ha adivinado la canción"""
    if game_id not in games:
        return {"error": "Partida no encontrada"}

    track = games[game_id]["track"]
    if guess.lower() in track["title"].lower():
        games[game_id]["guessed"] = True
        return {
            "correct": True,
            "title": track["title"],
            "artist": track["artist"],
            "artwork": track["artwork"],
        }

    return {"correct": False}
