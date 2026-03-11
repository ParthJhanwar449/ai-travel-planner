import secrets
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

# Schemas
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    GoogleLoginRequest,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest
)

# Auth Handlers
from app.auth.password_handler import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.google_handler import GOOGLE_CLIENT_ID, verify_google_token

# Database
from app.utils.database import engine, get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


# -----------------------
# REGISTER
# -----------------------
@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest):

    with engine.begin() as conn:

        # Check if email exists
        result = conn.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": request.email}
        )

        if result.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_pwd = hash_password(request.password)

        insert_result = conn.execute(
            text("""
                INSERT INTO users (
                    email,
                    hashed_password,
                    interest_culture,
                    interest_nature,
                    interest_food,
                    interest_entertainment,
                    budget_level,
                    is_admin
                )
                VALUES (
                    :email,
                    :hashed_password,
                    :interest_culture,
                    :interest_nature,
                    :interest_food,
                    :interest_entertainment,
                    :budget_level,
                    :is_admin
                )
                RETURNING id
            """),
            {
                "email": request.email,
                "hashed_password": hashed_pwd,
                "interest_culture": request.interest_culture,
                "interest_nature": request.interest_nature,
                "interest_food": request.interest_food,
                "interest_entertainment": request.interest_entertainment,
                "budget_level": request.budget_level,
                "is_admin": False
            }
        )

        user_id = insert_result.fetchone()[0]

    token = create_access_token({"user_id": int(user_id)})

    return {
        "access_token": token,
        "user": {
            "id": user_id,
            "email": request.email,
            "is_admin": False
        }
    }


# -----------------------
# LOGIN (Email + Password)
# -----------------------
@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):

    with engine.begin() as conn:

        result = conn.execute(
            text("SELECT id, email, hashed_password, is_admin FROM users WHERE email = :email"),
            {"email": request.email}
        )

        user = result.fetchone()

        if not user:
            raise HTTPException(status_code=400, detail="Invalid credentials")

        user_id, email, hashed_password, is_admin = user

        if not verify_password(request.password, hashed_password):
            raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"user_id": int(user_id)})

    return {
        "access_token": token,
        "user": {
            "id": user_id,
            "email": email,
            "is_admin": is_admin
        }
    }


# -----------------------
# GOOGLE LOGIN (Simplified)
# -----------------------
@router.post("/google-login", response_model=TokenResponse)
def google_login(request: GoogleLoginRequest):

    print(f"--- DEBUG: Receiving access_token: {request.access_token[:30]}...")
    print(f"--- DEBUG: Using GOOGLE_CLIENT_ID: {GOOGLE_CLIENT_ID}")

    idinfo = verify_google_token(request.access_token)

    if not idinfo or isinstance(idinfo, str):
        error_detail = idinfo if isinstance(idinfo, str) else "Invalid Google token"
        raise HTTPException(
            status_code=400, 
            detail=f"Google Auth Check failed: {error_detail}"
        )

    email = idinfo["email"]

    with engine.begin() as conn:

        result = conn.execute(
            text("SELECT id, email, is_admin FROM users WHERE email = :email"),
            {"email": email}
        )

        user = result.fetchone()

        if not user:
            insert_result = conn.execute(
                text("""
                    INSERT INTO users (
                        email,
                        hashed_password,
                        budget_level,
                        is_admin
                    )
                    VALUES (
                        :email,
                        :hashed_password,
                        'Medium',
                        :is_admin
                    )
                    RETURNING id, email, is_admin
                """),
                {
                    "email": email,
                    "hashed_password": hash_password("google_oauth_user"),
                    "is_admin": False
                }
            )
            user_data = insert_result.fetchone()
            user_id, email, is_admin = user_data
        else:
            user_id, email, is_admin = user

    token = create_access_token({"user_id": int(user_id)})

    return {
        "access_token": token,
        "user": {
            "id": user_id,
            "email": email,
            "is_admin": is_admin
        }
    }


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reset_token = secrets.token_urlsafe(32)

    user.reset_token = reset_token
    db.commit()

    return {
        "message": "Reset link generated",
        "reset_token": reset_token
    }


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.reset_token == request.token).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Hash the new password and clear the token
    user.hashed_password = hash_password(request.new_password)
    user.reset_token = None

    db.commit()

    return {"message": "Password updated successfully"}
