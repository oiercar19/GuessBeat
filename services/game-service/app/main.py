from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import models, database, crud
from app.routers import game, categories

app = FastAPI(title="GuessBeat Game Service (MySQL)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    crud.add_default_data(db)
    db.close()

@app.get("/")
def root():
    return {"message": "🎮 Servicio de juego activo con MySQL"}

app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(game.router, prefix="/game", tags=["Game"])
