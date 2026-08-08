from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import DateTime

from app.database.database import Base


class Income(Base):
    __tablename__ = "incomes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    source = Column(
        String(100),
        nullable=False
    )

    amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    income_date = Column(
        Date,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="incomes"
    )