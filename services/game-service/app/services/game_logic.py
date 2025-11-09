import random
from app.services.soundcloud import search_tracks

games = {}

def start_game(category: str):
    """Crea una nueva partida y devuelve la primera canción"""
    tracks = search_tracks(category, limit=20)
    if not tracks:
        raise ValueError("No se encontraron canciones en SoundCloud")

    selected = random.choice(tracks)
    game_id = str(random.randint(1000, 9999))

    games[game_id] = {
        "track": selected,
        "fragments": [15, 30, 45, 60, 90],
        "current_fragment": 0,
        "guessed": False
    }

    return {
        "game_id": game_id,
        "fragment_length": games[game_id]["fragments"][0],
        "track_preview": selected
    }

def next_fragment(game_id: str):
    """Desbloquea el siguiente fragmento"""
    if game_id not in games:
        raise ValueError("Partida no encontrada")

    game = games[game_id]
    if game["current_fragment"] >= len(game["fragments"]) - 1:
        return {"message": "No hay más fragmentos disponibles"}

    game["current_fragment"] += 1
    return {
        "fragment_length": game["fragments"][game["current_fragment"]],
        "track_preview": game["track"]
    }

def check_guess(game_id: str, guess: str):
    """Comprueba si el jugador acertó"""
    if game_id not in games:
        raise ValueError("Partida no encontrada")

    track = games[game_id]["track"]
    if guess.lower() in track["title"].lower():
        games[game_id]["guessed"] = True
        return {"correct": True, "title": track["title"]}
    return {"correct": False}
