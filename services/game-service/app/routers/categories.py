from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_categories():
    """Devuelve las categorías de juego disponibles"""
    return [
        {"id": "clasica", "name": "🎻 Música Clásica", "query": "classical"},
        {"id": "tecno", "name": "🎧 Tecno", "query": "techno"},
        {"id": "reggaeton", "name": "🎶 Reggaeton", "query": "reggaeton"},
        {"id": "rock", "name": "🎸 Rock", "query": "rock"},
        {"id": "pop", "name": "🎤 Pop", "query": "pop"}
    ]
