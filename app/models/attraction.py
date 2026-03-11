from sqlalchemy import Column, Integer, String, Float, ForeignKey, Time
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.utils.database import Base


class Attraction(Base):
    __tablename__ = "attractions"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Foreign key to cities table (UUID)
    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=False)

    estimated_cost = Column(Float)

    # Category indicators (ML features)
    category_attraction = Column(Integer)
    category_museum = Column(Integer)
    category_park = Column(Integer)
    category_theme_park = Column(Integer)

    # Scoring features
    attr_culture_score = Column(Float)
    attr_nature_score = Column(Float)
    attr_entertainment_score = Column(Float)

    interest_match_score = Column(Float)
    cost_ratio = Column(Float)
    budget_score = Column(Float)
    final_score = Column(Float)

    key = Column(Integer)

    # Opening hours
    opening_time = Column(Time, nullable=True)
    closing_time = Column(Time, nullable=True)
    closed_days = Column(String, nullable=True)

    # Relationship to City
    city = relationship("City", back_populates="attractions")
    