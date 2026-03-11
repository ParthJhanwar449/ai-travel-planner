from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class HotelCreate(BaseModel):
    name: str
    city_id: UUID
    latitude: float
    longitude: float
    price_per_night: float
    rating: Optional[float] = None
    amenities: Optional[str] = None
    total_rooms: Optional[int] = None
    image_url: Optional[str] = None


class HotelResponse(BaseModel):
    id: UUID
    name: str
    city_id: UUID
    latitude: float
    longitude: float
    price_per_night: float
    rating: Optional[float]
    amenities: Optional[str]
    total_rooms: Optional[int]
    image_url: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True
        