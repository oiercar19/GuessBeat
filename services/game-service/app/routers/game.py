from fastapi import APIRouter, Depends, Query, Request, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import re
import requests
from collections import defaultdict, deque
from app.db.database import get_db
from app.db import crud
from app.services.soundcloud import search_tracks

router = APIRouter()

class SongCreate(BaseModel):
    title: str
    artist: str
    release_year: str
    category_id: int
    permalink_url: str = None
    artwork: str = None

games = {}

song_history = defaultdict(lambda: deque(maxlen=5))  # Guarda las últimas 5 canciones por categoría

@router.get("/start")
def start_game(category: int = Query(..., description="ID de la categoría"), db: Session = Depends(get_db)):
    """Selecciona una canción aleatoria desde la DB y obtiene su stream de SoundCloud."""
    # Obtener historial de canciones recientes para esta categoría
    recent_song_ids = list(song_history[category])
    
    # Seleccionar canción evitando las recientes
    song = crud.get_random_song_by_category(db, category, exclude_ids=recent_song_ids)
    if not song:
        return {"error": "No hay canciones en esta categoría"}
    
    # Añadir la canción al historial
    song_history[category].append(song.id)

    # Intentar usar los datos guardados en la BD
    permalink = song.permalink_url
    artwork = song.artwork
    
    # Solo buscar en SoundCloud si faltan datos
    if not permalink or not artwork:
        search_query = f"{song.title} {song.artist}" if song.artist else song.title
        results = search_tracks(search_query)
        
        if not results and song.artist:
            results = search_tracks(song.title)
        
        if not results:
            return {"error": f"No se encontró '{song.title}' en SoundCloud"}
        
        sc_track = results[0]
        # Usar datos de SoundCloud solo para lo que falta
        if not permalink:
            permalink = sc_track["permalink_url"]
        if not artwork:
            artwork = sc_track["artwork"]
    
    return {
        "title": song.title,
        "artist": song.artist,
        "release_year": song.release_year,
        "artwork": artwork,
        "permalink_url": permalink,
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
    """Búsqueda refinada: evita remixes, versiones, covers y duplicados."""
    # Intentar búsqueda con capitalización original y con title case
    results = search_tracks(query, limit=40)
    
    # Si no hay resultados con la query original, probar con title case
    if len(results) < 3:
        query_title_case = query.title()
        if query_title_case != query:
            additional_results = search_tracks(query_title_case, limit=40)
            # Combinar resultados sin duplicados por ID
            existing_ids = {r["id"] for r in results}
            for r in additional_results:
                if r["id"] not in existing_ids:
                    results.append(r)
                    existing_ids.add(r["id"])
    
    if not results:
        return []

    filtered = []
    seen_titles = set()

    bad_keywords = [
        "remix", "mix", "edit", "bootleg", "mashup", "cover", "karaoke",
        "instrumental", "acapella", "remake", "rework", "flip", "vip",
        "remastered", "remaster", "tribute", "version", "extended", "radio edit",
        "club", "dub", "unofficial", "demo", "leaked", "snippet", "preview", "dj", "DJ"
    ]

    for r in results:
        title = r["title"]
        title_lower = title.lower()
        artist = r["artist"].lower() if r.get("artist") else ""
        
        if "(" in title or ")" in title or "[" in title or "]" in title:
            continue
        
        has_bad_keyword = False
        for bad in bad_keywords:
            # Buscar la palabra completa (con espacios o al final)
            if f" {bad} " in f" {title_lower} " or title_lower.endswith(f" {bad}"):
                has_bad_keyword = True
                break
        
        if has_bad_keyword:
            continue
        
        normalized_title = title_lower.split(" - ")[0].strip()
        normalized_title = re.sub(r"[^\w\s]", "", normalized_title)
        normalized_title = re.sub(r"\s+", " ", normalized_title).strip()
        
        unique_key = f"{normalized_title}|{artist}"
        
        if unique_key in seen_titles:
            continue
        
        seen_titles.add(unique_key)
        filtered.append(r)

        # Limitar a 10 resultados únicos
        if len(filtered) >= 10:
            break

    return filtered


@router.post("/check-year")
def check_year_guess(
    release_year: str = Query(...),
    guess: str = Query(...),
    request: Request = None
):
    """
    Comprueba si el jugador ha adivinado el año de lanzamiento.
    Calcula puntos según el intento (5 intentos disponibles).
    """
    username = request.headers.get("X-Username")
    attempt = int(request.headers.get("X-Attempt", 1))

    # Sistema de puntos para modo año (5 intentos)
    points_table = {1: 10, 2: 8, 3: 6, 4: 4, 5: 2}
    points = 0

    # Normalizar años (eliminar espacios y verificar)
    correct_year = release_year.strip()
    guessed_year = guess.strip()

    is_correct = correct_year == guessed_year

    if is_correct:
        points = points_table.get(attempt, 0)
        if username:
            update_user_points(username, points)
        return {"correct": True, "year": correct_year, "points": points}

    # Si falla en el último intento
    if attempt >= 5 and username:
        update_user_points(username, -8)
        points = -8
    else:
        points = 0

    return {"correct": False, "points": points, "year": correct_year}


@router.post("/check")
def check_guess(
    title: str = Query(...),
    guess: str = Query(...),
    request: Request = None
):
    """
    Comprueba si el jugador ha adivinado la canción.
    Ignora mayúsculas, espacios y guiones. Calcula puntos según el intento.
    """
    username = request.headers.get("X-Username")  # lo manda el frontend
    attempt = int(request.headers.get("X-Attempt", 1))  # intento actual

    # --- Normalización del título ---
    title_clean = title.lower().strip()
    guess_clean = guess.lower().strip()

    # Extraer solo el nombre de la canción (eliminar artista)
    # Si el formato es "Artista - Canción", tomar la segunda parte
    # Si el formato es "Canción - Artista", depende del contexto
    title_parts = title_clean.split(" - ")
    guess_parts = guess_clean.split(" - ")
    
    # Si hay " - ", tomar ambas partes para comparar
    if len(title_parts) > 1:
        # Puede ser "Artista - Canción" o "Canción - Artista"
        title_song = title_parts[-1].strip()  # última parte (generalmente la canción)
        title_artist = title_parts[0].strip()  # primera parte (generalmente el artista)
    else:
        title_song = title_clean
        title_artist = ""
    
    if len(guess_parts) > 1:
        guess_song = guess_parts[-1].strip()
        guess_artist = guess_parts[0].strip()
    else:
        guess_song = guess_clean
        guess_artist = ""

    # Eliminar texto entre paréntesis y corchetes
    title_song = re.sub(r"[\(\[].*?[\)\]]", "", title_song).strip()
    title_artist = re.sub(r"[\(\[].*?[\)\]]", "", title_artist).strip()
    guess_song = re.sub(r"[\(\[].*?[\)\]]", "", guess_song).strip()
    guess_artist = re.sub(r"[\(\[].*?[\)\]]", "", guess_artist).strip()

    # Eliminar caracteres especiales y espacios múltiples
    def normalize(text):
        text = re.sub(r"[^\w\s]", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text
    
    title_song = normalize(title_song)
    title_artist = normalize(title_artist)
    guess_song = normalize(guess_song)
    guess_artist = normalize(guess_artist)
    title_full = normalize(title_clean)
    guess_full = normalize(guess_clean)

    # --- Sistema de puntos ---
    points_table = {1: 10, 2: 8, 3: 6, 4: 4, 5: 2}
    points = 0

    # --- Comprobación flexible ---
    # Acepta si el nombre de la canción está contenido en la respuesta (para autocompletado)
    is_correct = (
        # Coincidencia exacta del nombre de la canción
        title_song == guess_song or
        # Si el usuario escribió artista + canción completo
        (title_artist and guess_artist and 
         title_artist == guess_artist and title_song == guess_song) or
        # Coincidencia completa normalizada
        title_full == guess_full or
        # Permitir que el usuario escriba solo la canción cuando el título tiene "Artista - Canción"
        (title_artist and not guess_artist and title_song == guess_song) or
        # Permitir que el usuario escriba solo la canción cuando el título tiene "Canción - Artista"
        (title_artist and not guess_artist and title_artist == guess_song) or
        # Aceptar si el nombre de la canción está contenido en la respuesta (ej: autocompletado)
        title_song in guess_full or
        # Aceptar si cualquier parte del título está en la respuesta
        (title_artist and title_artist in guess_full and title_song in guess_full)
    )

    if is_correct:
        points = points_table.get(attempt, 0)
        if username:
            update_user_points(username, points)
        return {"correct": True, "title": title, "points": points}

    # Si falla en el último intento
    if attempt >= 5 and username:
        update_user_points(username, -8)
        points = -8
    else:
        points = 0

    return {"correct": False, "points": points}

def update_user_points(username: str, points: int):
    """Envía una actualización de puntos al microservicio de usuarios (Node.js)."""
    try:
        res = requests.post(
            "http://localhost:5000/api/users/update-stats",
            json={"username": username, "points": points},
            timeout=5
        )
        if res.status_code != 200:
            print(f"⚠️ Error al actualizar puntos: {res.text}")
    except Exception as e:
        print(f"❌ No se pudo conectar con el microservicio de usuarios: {e}")


@router.post("/songs")
def create_song(song: SongCreate, db: Session = Depends(get_db)):
    """Endpoint para que el admin añada canciones manualmente."""
    try:
        new_song = crud.add_song(
            db=db,
            title=song.title,
            artist=song.artist,
            release_year=song.release_year,
            category_id=song.category_id,
            permalink_url=song.permalink_url,
            artwork=song.artwork
        )
        return {
            "message": "Canción añadida correctamente",
            "song": {
                "id": new_song.id,
                "title": new_song.title,
                "artist": new_song.artist,
                "release_year": new_song.release_year,
                "category_id": new_song.category_id
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



