from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets

from app.models.user import User
from app.auth.hashing import verify_password, hash_password


def get_user_by_email(
    db: Session,
    email: str
):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def create_user(
    db: Session,
    full_name: str,
    email: str,
    password: str
):
    user = User(
        full_name=full_name,
        email=email,
        password=password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str
):
    user = get_user_by_email(
        db,
        email
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.password
    ):
        return None

    return user


def update_user(
    db: Session,
    user: User,
    full_name: str,
    email: str
):
    user.full_name = full_name
    user.email = email

    db.commit()
    db.refresh(user)

    return user

def create_password_reset_token(
    db: Session,
    user: User
):
    token = secrets.token_urlsafe(32)

    user.reset_token = token
    user.reset_token_expires = (
        datetime.utcnow() + timedelta(minutes=30)
    )

    db.commit()
    db.refresh(user)

    return token


def get_user_by_reset_token(
    db: Session,
    token: str
):
    user = (
        db.query(User)
        .filter(User.reset_token == token)
        .first()
    )

    if not user:
        return None

    if (
        not user.reset_token_expires
        or user.reset_token_expires < datetime.utcnow()
    ):
        return None

    return user


def reset_user_password(
    db: Session,
    user: User,
    new_password: str
):
    user.password = hash_password(new_password)

    # Invalidate the token after successful reset
    user.reset_token = None
    user.reset_token_expires = None

    db.commit()
    db.refresh(user)

    return user