from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from app.admin.admin_city import router as admin_city_router
from app.admin.admin_attraction import router as admin_attraction_router
from app.admin.admin_hotel import router as admin_hotel_router
from app.admin.admin_users import router as admin_users_router
from app.admin.admin_stats import router as admin_stats_router

# Database
from app.utils.database import get_db, engine, Base

# Auth
from app.auth.auth_routes import router as auth_router
from app.auth.auth_dependency import get_current_user
from app.auth.password_handler import verify_password, hash_password

# Schemas
from app.schemas.user_schema import (
    UpdatePreferencesRequest,
    ChangePasswordRequest,
    UserResponse
)

from app.schemas.trip_schema import (
    TripRequest,
    TripResponse,
    TripSummary,
    TripDetailResponse
)

# Services
from app.services.trip_service import (
    generate_and_save_trip,
    get_user_trips,
    get_trip_detail
)

# ML
from app.ml.model_loader import model_loader
from app.utils.user_loader import get_user_by_id

# 🔥 IMPORT ALL MODELS (VERY IMPORTANT)
from app.models import User, Attraction,Trip, TripActivity, Interaction, City, Hotel, HotelSeasonalPricing, CityClimate

app = FastAPI(
    title="AI Travel Planner",
    version="1.0.0",
    description="Phase-1 AI Travel Planner Backend"
)

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Include Auth Routes
# -----------------------------
app.include_router(auth_router)
app.include_router(admin_city_router)
app.include_router(admin_attraction_router)
app.include_router(admin_hotel_router)
app.include_router(admin_users_router)
app.include_router(admin_stats_router)

# -----------------------------
# Startup Event
# -----------------------------
@app.on_event("startup")
def startup_event():
    # Load ML model
    model_loader.load()

    # Create tables
    Base.metadata.create_all(bind=engine)


# -----------------------------
# Root
# -----------------------------
@app.get("/")
def root():
    return {"message": "AI Travel Planner Backend Running"}


# -----------------------------
# Generate Itinerary
# -----------------------------
@app.post("/generate-itinerary", response_model=TripResponse)
def generate_itinerary(
    request: TripRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_profile = get_user_by_id(current_user.id)

    if not user_profile:
        raise HTTPException(status_code=404, detail="User not found")

    result = generate_and_save_trip(
        db=db,
        user_id=current_user.id,
        user_row=user_profile,
        city=request.city,
        trip_days=request.trip_days,
        activities_per_day=request.activities_per_day,
        trip_month=request.trip_month,
    )

    return result


# -----------------------------
# List User Trips
# -----------------------------
@app.get("/trips", response_model=list[TripSummary])
def list_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_trips(db, current_user.id)


# -----------------------------
# Trip Detail
# -----------------------------
@app.get("/trips/{trip_id}", response_model=TripDetailResponse)
def trip_detail(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = get_trip_detail(db, current_user.id, trip_id)

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    return trip


# -----------------------------
# Update Preferences
# -----------------------------
@app.put("/users/me/preferences")
def update_preferences(
    request: UpdatePreferencesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.interest_culture = request.interest_culture
    user.interest_nature = request.interest_nature
    user.interest_food = request.interest_food
    user.interest_entertainment = request.interest_entertainment
    user.budget_level = request.budget_level

    db.commit()
    db.refresh(user)

    return {"message": "Preferences updated successfully"}


# -----------------------------
# Get Current User
# -----------------------------
@app.get("/users/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# -----------------------------
# Change Password
# -----------------------------
@app.put("/users/me/password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(request.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    user.hashed_password = hash_password(request.new_password)
    db.commit()
    db.refresh(user)

    return {"message": "Password updated successfully"}
