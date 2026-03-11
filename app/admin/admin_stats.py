from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.utils.database import get_db
from app.models import User, Trip

router = APIRouter(prefix="/admin", tags=["Admin Stats"])


@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):

    total_users = db.query(User).count()

    total_trips = db.query(Trip).count()

    avg_cost = db.query(func.avg(Trip.total_cost)).scalar()

    popular_city = (
        db.query(Trip.city, func.count(Trip.city).label("count"))
        .group_by(Trip.city)
        .order_by(func.count(Trip.city).desc())
        .first()
    )

    return {
        "total_users": total_users,
        "total_trips": total_trips,
        "avg_trip_cost": round(avg_cost or 0, 2),
        "most_popular_city": popular_city.city if popular_city else None
    }