from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.database import engine

# Import models (helps SQLAlchemy register them)
from app.models.user import User
from app.models.category import Category
from app.models.expense import Expense
from app.models.income import Income


# Import routers
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.categories import router as category_router
from app.routers.expenses import router as expense_router
from app.routers.income import router as income_router
from app.routers.dashboard import router as dashboard_router


app = FastAPI(
    title="SpendWise AI API",
    description="AI Powered Personal Finance Assistant",
    version="0.1.0",
)


# =========================
# CORS CONFIGURATION
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# REGISTER ROUTERS
# =========================

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(category_router)
app.include_router(expense_router)
app.include_router(income_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to SpendWise AI API!"
    }


@app.get("/db-test")
def db_test():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "database": "Connected successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )