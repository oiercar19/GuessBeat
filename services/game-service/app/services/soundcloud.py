import os
import requests
from dotenv import load_dotenv

load_dotenv()

SOUNDCLOUD_API = "https://api.soundcloud.com"
TOKEN_URL = "https://api.soundcloud.com/oauth2/token"

CLIENT_ID = os.getenv("SOUNDCLOUD_CLIENT_ID")
CLIENT_SECRET = os.getenv("SOUNDCLOUD_CLIENT_SECRET")

if not CLIENT_ID or not CLIENT_SECRET:
    raise ValueError("❌ Faltan las credenciales de SoundCloud en el archivo .env")

_access_token = None  # cache global


def get_access_token():
    """Obtiene (o reutiliza) el token de acceso de SoundCloud"""
    global _access_token
    if _access_token:
        return _access_token

    data = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }

    resp = requests.post(TOKEN_URL, data=data)
    if resp.status_code != 200:
        print("❌ Error al obtener token:", resp.text)
        raise Exception("No se pudo obtener token de SoundCloud")

    _access_token = resp.json().get("access_token")
    return _access_token


def search_tracks(query: str, limit: int = 10):
    """Busca canciones en SoundCloud usando la API oficial"""
    token = get_access_token()
    headers = {"Authorization": f"OAuth {token}"}

    params = {
        "q": query,
        "limit": limit,
        "linked_partitioning": 1
    }

    resp = requests.get(f"{SOUNDCLOUD_API}/tracks", headers=headers, params=params)
    if resp.status_code != 200:
        print("❌ Error SoundCloud API:", resp.status_code, resp.text)
        raise Exception(f"Error SoundCloud API: {resp.status_code}")

    data = resp.json()

    # ✅ SoundCloud devuelve un diccionario con "collection"
    tracks_data = data.get("collection", []) if isinstance(data, dict) else data

    results = []
    for track in tracks_data:
        if isinstance(track, dict) and track.get("streamable") and track.get("title"):
            results.append({
                "id": track["id"],
                "title": track["title"],
                "artist": track["user"]["username"],
                "artwork": track.get("artwork_url") or "https://via.placeholder.com/150",
                "stream_url": f"{track['stream_url']}?client_id={CLIENT_ID}" if track.get("stream_url") else None,
                "permalink_url": track.get("permalink_url"),
                "release_year": track.get("release_year") or track.get("release") or "Desconocido"
            })

    return results
