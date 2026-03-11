import uuid
from sqlalchemy import Column, String, Float, Boolean, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.utils.database import Base


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=False)

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    price_per_night = Column(Float, nullable=False)
    rating = Column(Float, nullable=True)

    amenities = Column(Text, nullable=True)

    total_rooms = Column(Integer, nullable=True)

    image_url = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    city = relationship("City", back_populates="hotels")
    seasonal_prices = relationship(
        "HotelSeasonalPricing",
        back_populates="hotel",
        cascade="all, delete"
    )
    