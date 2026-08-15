from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    full_name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String(255),
        nullable=False
    )

    profile_picture = Column(
        String(500),
        nullable=True
    )

    # =========================
    # PASSWORD RESET
    # =========================

    reset_token = Column(
        String(255),
        nullable=True,
        unique=True,
        index=True
    )

    reset_token_expires = Column(
        DateTime,
        nullable=True
    )

    # =========================
    # TIMESTAMPS
    # =========================

    created_at = Column(
        DateTime,
        default=datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
        nullable=False
    )

    categories = relationship(
        "Category",
        back_populates="user"
    )

    expenses = relationship(
        "Expense",
        back_populates="user"
    )

    incomes = relationship(
        "Income",
        back_populates="user"
    )

    assistant_messages = relationship(
        "AssistantMessage",
        back_populates="user",
        cascade="all, delete-orphan"
    )