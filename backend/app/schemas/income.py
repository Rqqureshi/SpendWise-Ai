from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel


class IncomeCreate(BaseModel):
    source: str
    amount: Decimal
    income_date: date


class IncomeUpdate(BaseModel):
    source: str | None = None
    amount: Decimal | None = None
    income_date: date | None = None


class IncomeResponse(BaseModel):
    id: int
    source: str
    amount: Decimal
    income_date: date
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True