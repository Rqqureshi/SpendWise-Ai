from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

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