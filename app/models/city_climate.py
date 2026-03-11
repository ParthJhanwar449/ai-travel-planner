from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.utils.database import Base


class CityClimate(Base):
    __tablename__ = "city_climate"

    id = Column(Integer, primary_key=True, index=True)

    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=False)

    month = Column(Integer, nullable=False)  # 1–12

    avg_temperature = Column(Float, nullable=False)

    city = relationship("City")

    