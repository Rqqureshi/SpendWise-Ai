from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.models.expense import Expense
from app.models.income import Income
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_services import (
    get_dashboard_summary,
    get_monthly_cashflow,
    get_expense_categories
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.dashboard_services import get_dashboard_summary

    return get_dashboard_summary(
        db,
        current_user.id
    )

@router.get(
    "/summary",
    response_model=DashboardSummary
)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_summary(
        db,
        current_user.id
    )


@router.get(
    "/monthly-cashflow"
)
def monthly_cashflow(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_monthly_cashflow(
        db,
        current_user.id
    )


@router.get(
    "/expense-categories"
)
def expense_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_expense_categories(
        db,
        current_user.id
    )

@router.get("/transactions")
def get_all_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incomes = (
        db.query(Income)
        .filter(Income.user_id == current_user.id)
        .all()
    )

    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id)
        .all()
    )

    transactions = []

    for income in incomes:
        transactions.append({
            "id": income.id,
            "type": "income",
            "title": income.source,
            "amount": income.amount,
            "date": income.income_date,
            "category": None
        })

    for expense in expenses:
        transactions.append({
            "id": expense.id,
            "type": "expense",
            "title": expense.title,
            "amount": expense.amount,
            "date": expense.expense_date,
            "category": (
                expense.category.name
                if expense.category
                else None
            )
        })

    transactions.sort(
        key=lambda transaction: transaction["date"],
        reverse=True
    )

    return transactions