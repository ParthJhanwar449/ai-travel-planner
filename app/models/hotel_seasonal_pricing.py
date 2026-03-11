import uuid
from sqlalchemy import Column, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.utils.database import Base


class HotelSeasonalPricing(Base):
    __tablename__ = "hotel_seasonal_pricing"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    hotel_id = Column(UUID(as_uuid=True), ForeignKey("hotels.id"), nullable=False)

    month = Column(Integer, nullable=False)
    price_multiplier = Column(Float, nullable=False)
    is_peak_season = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    hotel = relationship("Hotel", back_populates="seasonal_prices")
    