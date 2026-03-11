from pydantic import BaseModel, Field
from typing import Optional


class UpdatePreferencesRequest(BaseModel):
    interest_culture: float = Field(..., ge=0, le=1)
    interest_nature: float = Field(..., ge=0, le=1)
    interest_food: float = Field(..., ge=0, le=1)
    interest_entertainment: float = Field(..., ge=0, le=1)
    budget_level: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class UserResponse(BaseModel):
    id: int
    email: str
    interest_culture: Optional[float] = None
    interest_nature: Optional[float] = None
    interest_food: Optional[float] = None
    interest_entertainment: Optional[float] = None
    budget_level: Optional[str] = None
    is_admin: bool

    class Config:
        from_attributes = True

        