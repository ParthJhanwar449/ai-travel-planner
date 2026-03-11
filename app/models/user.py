from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.utils.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Interest Scores (ML features)
    interest_culture = Column(Float)
    interest_nature = Column(Float)
    interest_food = Column(Float)
    interest_entertainment = Column(Float)

    budget_level = Column(String)
    reset_token = Column(String, nullable=True)

    # Admin Control
    is_admin = Column(Boolean, nullable=False, default=False)

    # System Fields
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    trips = relationship("Trip", back_populates="user")