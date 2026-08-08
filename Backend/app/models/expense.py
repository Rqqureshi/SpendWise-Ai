from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Numeric,
    Date,
    DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(150),
        nullable=False
    )

    amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    note = Column(
        String(255),
        nullable=True
    )

    expense_date = Column(
        Date,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id",
                    ondelete="CASCADE"
                    ),
        nullable=False
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id",
                    ondelete="RESTRICT"
                    ),
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="expenses"
    )

    category = relationship(
        "Category",
        back_populates="expenses"
    )