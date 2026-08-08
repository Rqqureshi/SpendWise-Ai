from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class TransactionResponse(BaseModel):
    id: int
    type: str
    title: str
    amount: Decimal
    date: date
    category: str | None = None

    class Config:
        from_attributes = True