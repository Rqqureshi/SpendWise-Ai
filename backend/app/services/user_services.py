from sqlalchemy.orm import Session

from app.models.user import User
from app.auth.hashing import verify_password


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