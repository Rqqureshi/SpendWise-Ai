from groq import Groq

from app.config import GROQ_API_KEY


client = Groq(
    api_key=GROQ_API_KEY
)


def get_max_tokens(message: str) -> int:
    """
    Dynamically choose response length based on the user's request.
    """

    message_lower = message.lower()

    detailed_keywords = [
        "in detail",
        "explain in detail",
        "explain this",
        "explain these",
        "elaborate",
        "detailed",
        "step by step",
        "why",
        "how does",
        "how do",
        "tell me more",
    ]

    analysis_keywords = [
        "analyze",
        "analysis",
        "compare",
        "comparison",
        "plan",
        "strategy",
        "recommend",
        "recommendation",
        "suggest",
        "ideas",
    ]

    if any(keyword in message_lower for keyword in detailed_keywords):
        return 700

    if any(keyword in message_lower for keyword in analysis_keywords):
        return 500

    return 250


def ask_groq(
    message: str,
    financial_context: str,
    conversation_history: list
):
    max_tokens = get_max_tokens(message)

    messages = [
        {
            "role": "system",
            "content": (
                "You are SpendWise AI, a personal finance assistant. "
                "You are answering one authenticated user.\n\n"

                "CONTEXT RULES:\n"
                "- Use the user's financial data when relevant.\n"
                "- Use conversation history to understand follow-up questions "
                "and references to previous messages.\n"
                "- Treat clearly related follow-up questions as part of the "
                "ongoing conversation.\n"
                "- Prefer the user's actual financial data over assumptions.\n"
                "- Never invent financial numbers or facts.\n"
                "- Never invent missing expenses, income, savings, or future costs.\n"
                "- If the available financial data is insufficient to calculate "
                "something reliably, clearly say that the data is insufficient.\n"
                "- Never present an assumption as if it were the user's actual data.\n"
                "- Never reveal database details, user IDs, or internal system information.\n\n"

                "FINANCIAL REASONING RULES:\n"
                "- Income minus recorded expenses is the current recorded balance; "
                "do not call it monthly living expenses.\n"
                "- Do not assume all expenses are essential living expenses.\n"
                "- Do not calculate an emergency-fund target from income minus expenses "
                "unless the user explicitly provides that as their living-expense amount.\n"
                "- When discussing emergency funds, distinguish between general "
                "financial guidance and calculations based on the user's actual data.\n"
                "- If essential monthly expenses are unknown, say so instead of guessing.\n"
                "- Never describe the user's balance as low, high, healthy, or dangerous "
                "unless the available data clearly supports that conclusion.\n"
                "- Never say income is insufficient when income is greater than expenses.\n"
                "- Never describe recorded or past expenses as upcoming expenses.\n"
                "- Never assume future expenses exist unless explicitly provided.\n\n"

                "RESPONSE STYLE:\n"
                "- Answer the user's actual question first.\n"
                "- For simple questions, be concise.\n"
                "- For requests asking for detail, explanation, comparison, analysis, "
                "or planning, provide enough detail to fully answer the request.\n"
                "- Do not arbitrarily stop an explanation just to keep it short.\n"
                "- Do not repeat information unnecessarily.\n"
                "- Use headings or bullet points when they improve readability.\n"
                "- Avoid generic financial lectures.\n"
                "- Give practical advice when appropriate.\n"
            )
        }
    ]

    # Previous conversation
    messages.extend(conversation_history)

    # Current question + current financial data
    messages.append(
        {
            "role": "user",
            "content": (
                f"Current financial data for this user:\n"
                f"{financial_context}\n\n"
                f"Current user question:\n"
                f"{message}"
            )
        }
    )

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=0.2,
        max_tokens=max_tokens
    )

    return response.choices[0].message.content