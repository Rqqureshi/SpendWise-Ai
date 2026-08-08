from pydantic import BaseModel
from app.enums.category_type import CategoryType


class CategoryCreate(BaseModel):
    name: str
    type: CategoryType


class CategoryUpdate(BaseModel):
    name: str | None = None
    type: CategoryType | None = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    type: CategoryType
    user_id: int

    class Config:
        from_attributes = True