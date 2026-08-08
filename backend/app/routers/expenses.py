from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User

from app.schemas.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse
)

from app.services.expense_services import (
    create_expense,
    get_expenses,
    get_expense,
    update_expense,
    delete_expense
)


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post(
    "/",
    response_model=ExpenseResponse
)
def create_new_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_expense(
        db,
        expense,
        current_user.id
    )


@router.get(
    "/",
    response_model=list[ExpenseResponse]
)
def get_all_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_expenses(
        db,
        current_user.id
    )


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def get_single_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = get_expense(
        db,
        expense_id,
        current_user.id
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return expense


@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def update_existing_expense(
    expense_id: int,
    expense: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_expense = get_expense(
        db,
        expense_id,
        current_user.id
    )

    if not existing_expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    updated_expense = update_expense(
        db,
        existing_expense,
        expense
    )

    return updated_expense


@router.delete(
    "/{expense_id}"
)
def delete_existing_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = get_expense(
        db,
        expense_id,
        current_user.id
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    delete_expense(
        db,
        expense
    )

    return {
        "message": "Expense deleted successfully"
    }