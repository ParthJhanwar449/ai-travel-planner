from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.utils.database import Base


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    attraction_id = Column(Integer, ForeignKey("attractions.id"), nullable=False)

    event_type = Column(String, nullable=False)  # view / generate / click

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    attraction = relationship("Attraction")
