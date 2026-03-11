import uuid
from sqlalchemy import Column, String, Boolean, Float, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.utils.database import Base


class City(Base):
    __tablename__ = "cities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    country = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    hero_image_url = Column(String, nullable=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    avg_daily_budget = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    attractions = relationship("Attraction", back_populates="city", cascade="all, delete")
    hotels = relationship("Hotel", back_populates="city", cascade="all, delete")
    