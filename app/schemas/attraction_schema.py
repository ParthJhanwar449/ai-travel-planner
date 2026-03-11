from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import time


class AttractionCreate(BaseModel):
    name: str
    city_id: UUID
    latitude: float
    longitude: float
    estimated_cost: Optional[float] = None

    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    closed_days: Optional[str] = None


class AttractionResponse(BaseModel):
    id: int
    name: str
    city_id: UUID
    city_name: str | None = None
    latitude: float
    longitude: float
    estimated_cost: Optional[float]
    opening_time: Optional[time]
    closing_time: Optional[time]
    closed_days: Optional[str]

    class Config:
        from_attributes = True