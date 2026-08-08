from enum import Enum


class CategoryType(str, Enum):
    income = "income"
    expense = "expense"