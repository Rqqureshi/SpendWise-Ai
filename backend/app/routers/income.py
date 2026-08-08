from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User

from app.schemas.income import (
    IncomeCreate,
    IncomeUpdate,
    IncomeResponse
)

from app.services.income_services import (
    create_income,
    get_incomes,
    get_income,
    update_income,
    delete_income
)


router = APIRouter(
    prefix="/incomes",
    tags=["Incomes"]
)


@router.post(
    "/",
    response_model=IncomeResponse
)
def create_new_income(
    income: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_income(
        db,
        income,
        current_user.id
    )


@router.get(
    "/",
    response_model=list[IncomeResponse]
)
def get_all_incomes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_incomes(
        db,
        current_user.id
    )


@router.get(
    "/{income_id}",
    response_model=IncomeResponse
)
def get_single_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    income = get_income(
        db,
        income_id,
        current_user.id
    )

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    return income


@router.put(
    "/{income_id}",
    response_model=IncomeResponse
)
def update_existing_income(
    income_id: int,
    income: IncomeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_income = get_income(
        db,
        income_id,
        current_user.id
    )

    if not existing_income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    updated = update_income(
        db,
        existing_income,
        income
    )

    return updated


@router.delete(
    "/{income_id}"
)
def delete_existing_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_income = get_income(
        db,
        income_id,
        current_user.id
    )

    if not existing_income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    delete_income(
        db,
        existing_income
    )

    return {
        "message": "Income deleted successfully"
    }