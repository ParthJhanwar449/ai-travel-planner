from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.utils.database import Base


class TripActivity(Base):
    __tablename__ = "trip_activities"

    id = Column(Integer, primary_key=True, index=True)

    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    attraction_id = Column(Integer, ForeignKey("attractions.id"), nullable=False)

    day = Column(Integer, nullable=False)
    cost = Column(Float, nullable=False)

    # Relationships
    trip = relationship("Trip", back_populates="activities")

    attraction = relationship("Attraction")
