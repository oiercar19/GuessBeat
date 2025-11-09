from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import categories, game

app = FastAPI(title="GuessBeat Game Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "🎮 Servicio de juego activo"}

# 👇 Prefijos importantes
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(game.router, prefix="/game", tags=["Game"])
