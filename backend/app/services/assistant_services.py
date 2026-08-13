from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.income import Income
from app.models.category import Category


def get_current_month_spending(
    db: Session,
    user_id: int
):
    today = date.today()

    start_of_month = today.replace(day=1)

    if today.month == 12:
        start_of_next_month = date(
            today.year + 1,
            1,
            1
        )
    else:
        start_of_next_month = date(
            today.year,
            today.month + 1,
            1
        )

    total_spending = (
        db.query(
            func.coalesce(
                func.sum(Expense.amount),
                0
            )
        )
        .filter(
            Expense.user_id == user_id,
            Expense.expense_date >= start_of_month,
            Expense.expense_date < start_of_next_month
        )
        .scalar()
    )

    return {
        "month": start_of_month.strftime("%Y-%m"),
        "total_spending": Decimal(total_spending)
    }

def get_current_month_category_spending(
    db: Session,
    user_id: int
):
    today = date.today()

    start_of_month = today.replace(day=1)

    if today.month == 12:
        start_of_next_month = date(
            today.year + 1,
            1,
            1
        )
    else:
        start_of_next_month = date(
            today.year,
            today.month + 1,
            1
        )

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
            Category.user_id == user_id,
            Expense.expense_date >= start_of_month,
            Expense.expense_date < start_of_next_month
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

def get_last_3_months_cashflow(
    db: Session,
    user_id: int
):
    today = date.today()

    months = []

    year = today.year
    month = today.month

    for _ in range(3):
        months.append((year, month))

        month -= 1

        if month == 0:
            month = 12
            year -= 1

    months.reverse()

    results = []

    for year, month in months:

        start_date = date(year, month, 1)

        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)

        income = (
            db.query(
                func.coalesce(
                    func.sum(Income.amount),
                    0
                )
            )
            .filter(
                Income.user_id == user_id,
                Income.income_date >= start_date,
                Income.income_date < end_date
            )
            .scalar()
        )

        expenses = (
            db.query(
                func.coalesce(
                    func.sum(Expense.amount),
                    0
                )
            )
            .filter(
                Expense.user_id == user_id,
                Expense.expense_date >= start_date,
                Expense.expense_date < end_date
            )
            .scalar()
        )

        income = Decimal(income)
        expenses = Decimal(expenses)

        results.append({
            "month": f"{year}-{month:02d}",
            "income": income,
            "expenses": expenses,
            "balance": income - expenses
        })

    return results

def get_spending_reduction_data(
    db: Session,
    user_id: int
):
    today = date.today()

    start_of_month = today.replace(day=1)

    if today.month == 12:
        start_of_next_month = date(
            today.year + 1,
            1,
            1
        )
    else:
        start_of_next_month = date(
            today.year,
            today.month + 1,
            1
        )

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
            Category.user_id == user_id,
            Expense.expense_date >= start_of_month,
            Expense.expense_date < start_of_next_month
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

    total_spending = sum(
        Decimal(row.amount)
        for row in category_data
    )

    results = []

    for row in category_data:
        amount = Decimal(row.amount)

        percentage = (
            (amount / total_spending) * 100
            if total_spending > 0
            else Decimal("0")
        )

        results.append({
            "category": row.category,
            "amount": amount,
            "percentage": round(percentage, 2)
        })

    return {
        "month": f"{today.year}-{today.month:02d}",
        "total_spending": total_spending,
        "categories": results
    }

def get_ai_financial_context(
    db: Session,
    user_id: int
):
    spending_data = get_current_month_spending(
        db,
        user_id
    )

    category_data = get_spending_reduction_data(
        db,
        user_id
    )

    cashflow_data = get_last_3_months_cashflow(
        db,
        user_id
    )

    # Find the current month's cashflow
    current_month = spending_data["month"]

    current_month_cashflow = next(
        (
            month
            for month in cashflow_data
            if month["month"] == current_month
        ),
        None
    )

    if current_month_cashflow:
        current_income = current_month_cashflow["income"]
        current_expenses = current_month_cashflow["expenses"]
        current_balance = current_month_cashflow["balance"]
    else:
        current_income = Decimal("0")
        current_expenses = spending_data["total_spending"]
        current_balance = current_income - current_expenses

    context = {
        "CURRENT_FINANCIAL_SNAPSHOT": {
            "current_month": current_month,
            "income_recorded_this_month": current_income,
            "expenses_recorded_this_month": current_expenses,
            "current_recorded_balance": current_balance
        },

        "CURRENT_MONTH_EXPENSE_BREAKDOWN": {
            "total_spending": category_data["total_spending"],
            "categories": category_data["categories"]
        },

        "PREVIOUS_MONTHS_CASHFLOW": [
            month
            for month in cashflow_data
            if month["month"] != current_month
        ],

        "IMPORTANT_RULES": [
            "The current recorded balance is income minus expenses for the current month.",
            "Current month expenses are already incurred expenses, not upcoming expenses.",
            "Upcoming or future expenses are unknown unless explicitly provided.",
            "Do not describe a positive balance as low unless the user provides a threshold or asks for an opinion.",
            "Do not treat the current month's balance as a previous month's balance.",
            "Use the current month's income, expenses, and balance when answering current financial questions.",
            "For arithmetic involving the user's balance, calculate using the provided numbers.",
            "Keep responses concise and directly answer the user's question."
        ]
    }

    return context