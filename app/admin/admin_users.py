from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.utils.database import get_db
from app.models import User, Trip

router = APIRouter(prefix="/admin", tags=["Admin Users"])


# ----------------------------------------------------
# Get all users (for admin list page)
# ----------------------------------------------------
@router.get("/users")
def get_all_users(search: str | None = None, db: Session = Depends(get_db)):

    query = db.query(User)

    # Search by email
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))

    users = query.order_by(User.created_at.desc()).all()

    return [
        {
            "id": user.id,
            "email": user.email,
            "is_admin": user.is_admin,
            "created_at": user.created_at
        }
        for user in users
    ]

# ----------------------------------------------------
# Get user profile + trip history
# ----------------------------------------------------
@router.get("/users/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):

    user = (
        db.query(User)
        .options(joinedload(User.trips))
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "budget_level": user.budget_level,
        "interests": {
            "culture": user.interest_culture,
            "nature": user.interest_nature,
            "food": user.interest_food,
            "entertainment": user.interest_entertainment,
        },
        "created_at": user.created_at,
        "trips": [
            {
                "id": trip.id,
                "city": trip.city,
                "trip_days": trip.trip_days,
                "total_cost": trip.total_cost,
                "created_at": trip.created_at
            }
            for trip in user.trips
        ]
    }