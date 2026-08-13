import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.auth.oauth2 import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse
from app.services.user_services import (
    get_user_by_email,
    update_user
)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.put(
    "/me",
    response_model=UserResponse
)

def update_me(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check whether the email is already used
    existing_user = get_user_by_email(
        db,
        user_data.email
    )

    if (
        existing_user
        and existing_user.id != current_user.id
    ):
        raise HTTPException(
            status_code=400,
            detail="Email is already registered."
        )

    updated_user = update_user(
        db,
        current_user,
        full_name=user_data.full_name,
        email=user_data.email
    )

    return updated_user

@router.put(
    "/me",
    response_model=UserResponse
)
def update_me(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_user = get_user_by_email(
        db,
        user_data.email
    )

    if (
        existing_user
        and existing_user.id != current_user.id
    ):
        raise HTTPException(
            status_code=400,
            detail="Email is already registered."
        )

    updated_user = update_user(
        db,
        current_user,
        full_name=user_data.full_name,
        email=user_data.email
    )

    return updated_user


@router.post("/me/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Allowed image types
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WebP images are allowed."
        )

    upload_dir = "uploads/profile_pictures"
    os.makedirs(upload_dir, exist_ok=True)

    extension = os.path.splitext(file.filename)[1].lower()
    filename = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(
        upload_dir,
        filename
    )

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Delete previous profile picture
    if current_user.profile_picture:
        old_file = current_user.profile_picture.lstrip("/")

        if os.path.exists(old_file):
            os.remove(old_file)

    current_user.profile_picture = (
        f"/uploads/profile_pictures/{filename}"
    )

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile picture updated successfully.",
        "profile_picture": current_user.profile_picture
    }