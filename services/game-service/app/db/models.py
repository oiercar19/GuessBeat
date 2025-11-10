from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)

    songs = relationship("Song", back_populates="category")


class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    artist = Column(String(100), nullable=True)
    release_year = Column(String(10), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    permalink_url = Column(String(300), nullable=True)
    artwork = Column(String(300), nullable=True)

    category = relationship("Category", back_populates="songs")
