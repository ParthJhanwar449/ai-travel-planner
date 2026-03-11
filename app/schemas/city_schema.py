from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class CityCreate(BaseModel):
    name: str
    country: str
    description: Optional[str] = None
    hero_image_url: Optional[str] = None
    avg_daily_budget: Optional[float] = None


class CityResponse(BaseModel):
    id: UUID
    name: str
    country: str
    description: Optional[str]
    hero_image_url: Optional[str]
    avg_daily_budget: Optional[float]
    is_active: bool

    class Config:
        from_attributes = True
        