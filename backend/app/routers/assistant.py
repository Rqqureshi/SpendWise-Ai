from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import re
from decimal import Decimal

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.models.assistant_message import AssistantMessage

from app.services.assistant_services import (
    get_current_month_spending,
    get_current_month_category_spending,
    get_last_3_months_cashflow,
    get_spending_reduction_data,
    get_ai_financial_context
)

from app.schemas.assistant import (
    AssistantChatRequest,
    AssistantChatResponse
)

from app.services.ai_service import ask_groq

router = APIRouter(
    prefix="/assistant",
    tags=["Assistant"]
)

def save_conversation_message(
    db: Session,
    user_id: int,
    role: str,
    content: str
):
    message = AssistantMessage(
        user_id=user_id,
        role=role,
        content=content
    )

    db.add(message)
    db.commit()

@router.get("/spending-this-month")
def spending_this_month(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_current_month_spending(
        db,
        current_user.id
    )

@router.get("/category-spending-this-month")
def category_spending_this_month(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_current_month_category_spending(
        db,
        current_user.id
    )

@router.get("/cashflow-last-3-months")
def cashflow_last_3_months(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_last_3_months_cashflow(
        db,
        current_user.id
    )

@router.get("/spending-reduction")
def spending_reduction(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_spending_reduction_data(
        db,
        current_user.id
    )

@router.post(
    "/chat",
    response_model=AssistantChatResponse
)
def assistant_chat(
    request: AssistantChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    original_message = request.message.strip()
    message = original_message.lower()

    # -------------------------
    # CURRENT MONTH SPENDING
    # -------------------------

    if (
        "how much did i spend this month" in message
        or "how much have i spent this month" in message
        or "what did i spend this month" in message
    ):
        data = get_current_month_spending(
            db,
            current_user.id
        )

        return {
            "message": (
                f"You have spent ${data['total_spending']:.2f} "
                f"this month."
            )
        }

    # -------------------------
    # TOP SPENDING CATEGORY
    # -------------------------

    if (
        "what category am i spending the most on" in message
        or "which category am i spending the most on" in message
        or "what am i spending the most on" in message
        or "where am i spending the most" in message
    ):
        categories = get_current_month_category_spending(
            db,
            current_user.id
        )

        if not categories:
            return {
                "message": "You don't have any expenses this month."
            }

        top_category = categories[0]

        return {
            "message": (
                f"You're spending the most on "
                f"{top_category['category']}, "
                f"with ${top_category['amount']:.2f} "
                f"spent this month."
            )
        }

        # -------------------------
    # LAST 3 MONTHS CASHFLOW
    # -------------------------

    if (
        "compare my income and expenses for the last 3 months" in message
        or "compare income and expenses for the last 3 months" in message
        or "income and expenses for the last 3 months" in message
        or "cashflow for the last 3 months" in message
    ):
        cashflow = get_last_3_months_cashflow(
            db,
            current_user.id
        )

        if not cashflow:
            return {
                "message": "There is no financial data for the last 3 months."
            }

        month_messages = []

        for month in cashflow:
            month_messages.append(
                f"{month['month']}: "
                f"Income ${month['income']:.2f}, "
                f"Expenses ${month['expenses']:.2f}, "
                f"Balance ${month['balance']:.2f}"
            )

        return {
            "message": (
                "Here is your income and expense comparison "
                "for the last 3 months:\n\n"
                + "\n".join(month_messages)
            )
        }

    # -------------------------
    # SPENDING REDUCTION
    # -------------------------

    if (
        "where can i reduce my spending" in message
        or "where should i reduce my spending" in message
        or "how can i reduce my spending" in message
        or "how can i cut my spending" in message
        or "where can i cut my spending" in message
    ):
        data = get_spending_reduction_data(
            db,
            current_user.id
        )

        if not data["categories"]:
            return {
                "message": "You don't have any expenses this month."
            }

        top_category = data["categories"][0]

        return {
            "message": (
                f"Your highest spending category this month is "
                f"{top_category['category']}, where you spent "
                f"${top_category['amount']:.2f}. "
                f"It represents "
                f"{top_category['percentage']:.2f}% "
                f"of your total spending. "
                f"You may want to review this category first "
                f"to see where you can reduce unnecessary spending."
            )
        }


    # -------------------------
    # AFFORDABILITY / BALANCE CALCULATIONS
    # -------------------------

    amount_match = re.search(
        r"\$?\s*(\d+(?:\.\d+)?)",
        message
    )

    if amount_match and (
        "can i afford" in message
        or "can i spend" in message
        or "how much will i have left" in message
        or "how much money will i have left" in message
        or "what will my balance be" in message
    ):
        requested_amount = Decimal(amount_match.group(1))

        cashflow = get_last_3_months_cashflow(
            db,
            current_user.id
        )

        current_month = cashflow[-1]

        current_balance = Decimal(current_month["balance"])

        remaining_balance = current_balance - requested_amount

        if "how much will i have left" in message or \
        "how much money will i have left" in message or \
        "what will my balance be" in message:

            return {
                "message": (
                    f"You'd have ${remaining_balance:.2f} left."
                )
            }

        if requested_amount <= current_balance:
            return {
                "message": (
                    f"Yes. You have ${current_balance:.2f}, "
                    f"so spending ${requested_amount:.2f} "
                    f"would leave you with ${remaining_balance:.2f}."
                )
            }

        shortfall = requested_amount - current_balance

        return {
            "message": (
                f"No. You have ${current_balance:.2f}, "
                f"but this would cost ${requested_amount:.2f}. "
                f"You'd be ${shortfall:.2f} short."
            )
        }


    # -------------------------
    # GROQ AI FALLBACK
    # -------------------------

    financial_data = get_ai_financial_context(
        db,
        current_user.id
    )

    financial_context = str(financial_data)

    # Get previous conversation for this user
    previous_messages = (
        db.query(AssistantMessage)
        .filter(
            AssistantMessage.user_id == current_user.id
        )
        .order_by(
            AssistantMessage.created_at.asc()
        )
        .all()
    )

    conversation_history = [
        {
            "role": message.role,
            "content": message.content
        }
        for message in previous_messages
    ]

    # Save current user message
    user_message = AssistantMessage(
        user_id=current_user.id,
        role="user",
        content=original_message
    )

    db.add(user_message)
    db.commit()

    # Ask Groq with conversation history
    ai_response = ask_groq(
        original_message,
        financial_context,
        conversation_history
    )

    # Save assistant response
    assistant_message = AssistantMessage(
        user_id=current_user.id,
        role="assistant",
        content=ai_response
    )

    db.add(assistant_message)
    db.commit()

    return {
        "message": ai_response
    }