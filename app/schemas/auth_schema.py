from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    interest_culture: float = 0.0
    interest_nature: float = 0.0
    interest_food: float = 0.0
    interest_entertainment: float = 0.0
    budget_level: str = "Medium"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    access_token: str


class UserInfo(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
