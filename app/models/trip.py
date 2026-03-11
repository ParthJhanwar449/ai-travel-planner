from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.utils.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    city = Column(String, nullable=False)
    trip_days = Column(Integer, nullable=False)
    total_cost = Column(Float, nullable=False)
    season = Column(String, nullable=False)

    hotel_id = Column(UUID(as_uuid=True), ForeignKey("hotels.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="trips")
    hotel = relationship("Hotel")

    activities = relationship(
        "TripActivity",
        back_populates="trip",
        cascade="all, delete-orphan"
    )
