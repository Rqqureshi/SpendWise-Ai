from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.models.user import User
from app.database.database import get_db

from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse
)

from app.services.category_services import (
    create_category,
    get_categories,
    get_category,
    update_category,
    delete_category
)

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.post(
    "/",
    response_model=CategoryResponse
)
def create_new_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_category(
        db,
        category,
        current_user.id
    )


@router.get(
    "/",
    response_model=list[CategoryResponse]
)
def get_all_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_categories(
        db,
        current_user.id
    )


@router.get(
    "/{category_id}",
    response_model=CategoryResponse
)
def get_single_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = get_category(
        db,
        category_id,
        current_user.id
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category


@router.put(
    "/{category_id}",
    response_model=CategoryResponse
)
def update_existing_category(
    category_id: int,
    updated_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = get_category(
        db,
        category_id,
        current_user.id
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return update_category(
        db,
        category,
        updated_data
    )


@router.delete(
    "/{category_id}"
)
def delete_existing_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = get_category(
        db,
        category_id,
        current_user.id
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    delete_category(
        db,
        category
    )

    return {
        "message": "Category deleted successfully"
    }