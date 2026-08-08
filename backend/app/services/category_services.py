from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import (CategoryCreate, CategoryUpdate)


def create_category(
    db: Session,
    category: CategoryCreate,
    user_id: int
):
    new_category = Category(
        name=category.name,
        type=category.type,
        user_id=user_id
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


def get_categories(
    db: Session,
    user_id: int
):
    return (
        db.query(Category)
        .filter(Category.user_id == user_id)
        .all()
    )


def get_category(
    db: Session,
    category_id: int,
    user_id: int
):
    return (
        db.query(Category)
        .filter(
            Category.id == category_id,
            Category.user_id == user_id
        )
        .first()
    )


def update_category(
    db: Session,
    category: Category,
    updated_data: CategoryUpdate
):
    if updated_data.name is not None:
        category.name = updated_data.name
    if updated_data.type is not None:
        category.type = updated_data.type

    db.commit()
    db.refresh(category)

    return category


def delete_category(
    db: Session,
    category: Category
):
    db.delete(category)
    db.commit()

    return True