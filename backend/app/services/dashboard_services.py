from decimal import Decimal

from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.income import Income
from app.models.category import Category


def get_dashboard_summary(
    db: Session,
    user_id: int
):
    total_income = (
        db.query(
            func.coalesce(
                func.sum(Income.amount),
                0
            )
        )
        .filter(
            Income.user_id == user_id
        )
        .scalar()
    )

    total_expenses = (
        db.query(
            func.coalesce(
                func.sum(Expense.amount),
                0
            )
        )
        .filter(
            Expense.user_id == user_id
        )
        .scalar()
    )

    income_count = (
        db.query(
            func.count(Income.id)
        )
        .filter(
            Income.user_id == user_id
        )
        .scalar()
    )

    expense_count = (
        db.query(
            func.count(Expense.id)
        )
        .filter(
            Expense.user_id == user_id
        )
        .scalar()
    )

    balance = total_income - total_expenses

    total_transactions = income_count + expense_count

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": balance,
        "total_transactions": total_transactions
    }


def get_monthly_cashflow(
    db: Session,
    user_id: int
):
    income_data = (
        db.query(
            extract("year", Income.income_date).label("year"),
            extract("month", Income.income_date).label("month"),
            func.sum(Income.amount).label("total")
        )
        .filter(
            Income.user_id == user_id
        )
        .group_by(
            extract("year", Income.income_date),
            extract("month", Income.income_date)
        )
        .all()
    )

    expense_data = (
        db.query(
            extract("year", Expense.expense_date).label("year"),
            extract("month", Expense.expense_date).label("month"),
            func.sum(Expense.amount).label("total")
        )
        .filter(
            Expense.user_id == user_id
        )
        .group_by(
            extract("year", Expense.expense_date),
            extract("month", Expense.expense_date)
        )
        .all()
    )

    months = {}

    for row in income_data:
        key = f"{int(row.year)}-{int(row.month):02d}"

        months[key] = {
            "month": key,
            "income": Decimal(row.total),
            "expenses": Decimal("0")
        }

    for row in expense_data:
        key = f"{int(row.year)}-{int(row.month):02d}"

        if key not in months:
            months[key] = {
                "month": key,
                "income": Decimal("0"),
                "expenses": Decimal(row.total)
            }
        else:
            months[key]["expenses"] = Decimal(row.total)

    return sorted(
        months.values(),
        key=lambda x: x["month"]
    )


def get_expense_categories(
    db: Session,
    user_id: int
):
    category_data = (
        db.query(
            Category.name.label("category"),
            func.sum(Expense.amount).label("amount")
        )
        .join(
            Expense,
            Expense.category_id == Category.id
        )
        .filter(
            Expense.user_id == user_id,
            Category.user_id == user_id
        )
        .group_by(
            Category.id,
            Category.name
        )
        .order_by(
            func.sum(Expense.amount).desc()
        )
        .all()
    )

    return [
        {
            "category": row.category,
            "amount": Decimal(row.amount)
        }
        for row in category_data
    ]