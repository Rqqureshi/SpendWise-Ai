from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def create_expense(
    db: Session,
    expense: ExpenseCreate,
    user_id: int
):
    new_expense = Expense(
        title=expense.title,
        amount=expense.amount,
        note=expense.note,
        expense_date=expense.expense_date,
        user_id=user_id,
        category_id=expense.category_id
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


def get_expenses(
    db: Session,
    user_id: int
):
    return (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .all()
    )


def get_expense(
    db: Session,
    expense_id: int,
    user_id: int
):
    return (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == user_id
        )
        .first()
    )


def update_expense(
    db: Session,
    expense: Expense,
    updated_data: ExpenseUpdate
):
    if updated_data.title is not None:
        expense.title = updated_data.title

    if updated_data.amount is not None:
        expense.amount = updated_data.amount

    if updated_data.note is not None:
        expense.note = updated_data.note

    if updated_data.expense_date is not None:
        expense.expense_date = updated_data.expense_date

    if updated_data.category_id is not None:
        expense.category_id = updated_data.category_id

    db.commit()
    db.refresh(expense)

    return expense


def delete_expense(
    db: Session,
    expense: Expense
):
    db.delete(expense)
    db.commit()

    return expense