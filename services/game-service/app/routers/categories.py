from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import crud

router = APIRouter()

@router.get("/")
def get_categories(db: Session = Depends(get_db)):
    cats = crud.get_categories(db)
    return [{"id": c.id, "name": c.name, "description": c.description} for c in cats]

