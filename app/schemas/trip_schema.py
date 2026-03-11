from pydantic import BaseModel
from datetime import datetime


# -----------------------
# Trip Generation Request
# -----------------------

class TripRequest(BaseModel):
    city: str
    trip_days: int
    activities_per_day: int
    trip_month: int


# -----------------------
# Trip Generation Response
# -----------------------

class Activity(BaseModel):
    id: int
    name: str
    estimated_cost: float
    day: int


class HotelResponse(BaseModel):
    name: str
    price_per_night: float
    latitude: float
    longitude: float


class TripResponse(BaseModel):
    trip_id: int
    season: str
    total_cost: float
    hotel_price_per_night: float = 0.0
    hotel_total_cost: float = 0.0
    attractions_cost: float = 0.0
    remaining_budget: float
    itinerary: list[Activity]
    hotel: HotelResponse | None = None


# -----------------------
# Trip Summary (List Trips)
# -----------------------

class TripSummary(BaseModel):
    id: int
    city: str
    season: str
    total_cost: float
    created_at: datetime

    class Config:
        from_attributes = True


# -----------------------
# Trip Detail View
# -----------------------

class AttractionDetail(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    cost: float


class TripDetailResponse(BaseModel):
    id: int
    city: str
    season: str
    total_cost: float
    hotel_total_cost: float = 0.0
    attractions_cost: float = 0.0
    trip_days: int
    created_at: datetime
    itinerary: dict[int, list[AttractionDetail]]
    hotel: HotelResponse | None = None

    class Config:
        from_attributes = True
        