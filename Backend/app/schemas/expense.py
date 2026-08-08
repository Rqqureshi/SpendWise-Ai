from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    title: str
    amount: Decimal
    note: str | None = None
    expense_date: date
    category_id: int


class ExpenseUpdate(BaseModel):
    title: str | None = None
    amount: Decimal | None = None
    note: str | None = None
    expense_date: date | None = None
    category_id: int | None = None


class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: Decimal
    note: str | None
    expense_date: date
    created_at: datetime
    user_id: int
    category_id: int

    class Config:
        from_attributes = True