from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token
from app.schemas.auth import (
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.services.user_services import (
    get_user_by_email,
    create_user,
    authenticate_user,
    create_password_reset_token,
    get_user_by_reset_token,
    reset_user_password
)
from app.auth.hashing import hash_password
from app.auth.jwt_handler import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = get_user_by_email(
        db,
        user.email
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(
        user.password
    )

    new_user = create_user(
        db,
        full_name=user.full_name,
        email=user.email,
        password=hashed_password
    )

    return new_user

@router.post(
        "/login",
        response_model=Token
        )
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(
        db,
        form_data.username,
        form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = get_user_by_email(
        db,
        request.email
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account found with this email."
        )

    token = create_password_reset_token(
        db,
        user
    )

    return {
        "message": "Password reset token generated.",
        "reset_token": token
    }


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    user = get_user_by_reset_token(
        db,
        request.token
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired password reset token."
        )

    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long."
        )

    reset_user_password(
        db,
        user,
        request.new_password
    )

    return {
        "message": "Password reset successfully."
    }
