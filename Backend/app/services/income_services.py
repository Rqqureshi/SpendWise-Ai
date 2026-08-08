from sqlalchemy.orm import Session

from app.models.income import Income
from app.schemas.income import IncomeCreate, IncomeUpdate


def create_income(
    db: Session,
    income: IncomeCreate,
    user_id: int
):
    new_income = Income(
        source=income.source,
        amount=income.amount,
        income_date=income.income_date,
        user_id=user_id
    )

    db.add(new_income)
    db.commit()
    db.refresh(new_income)

    return new_income


def get_incomes(
    db: Session,
    user_id: int
):
    return (
        db.query(Income)
        .filter(Income.user_id == user_id)
        .all()
    )


def get_income(
    db: Session,
    income_id: int,
    user_id: int
):
    return (
        db.query(Income)
        .filter(
            Income.id == income_id,
            Income.user_id == user_id
        )
        .first()
    )


def update_income(
    db: Session,
    income: Income,
    updated_data: IncomeUpdate
):
    if updated_data.source is not None:
        income.source = updated_data.source

    if updated_data.amount is not None:
        income.amount = updated_data.amount

    if updated_data.income_date is not None:
        income.income_date = updated_data.income_date

    db.commit()
    db.refresh(income)

    return income


def delete_income(
    db: Session,
    income: Income
):
    db.delete(income)
    db.commit()