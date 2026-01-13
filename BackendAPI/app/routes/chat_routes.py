from fastapi import APIRouter, HTTPException
from ..models.request_models import SearchQuery
from ..agents.chat_agent import get_chat_response
from ..services.specialize_search import specialized_providers

router = APIRouter()

@router.post("/chat")
async def chat_with_ai(query: SearchQuery):
    """
    Entry point for the chat interface.
    Handles both conversation and database searching
    """
    # 1. Get the full decision object from the AI Agent
    ai_decision = get_chat_response(query.user_text)

    found_providers = []

    # 2. If the AI decided we need to search, execute the search
    if ai_decision.search_filters:
        # Currently just processing the first filter for simplicity
        # (You can expand this loop later if you want multi-category search)
        primary_filter = ai_decision.search_filters[0]

        found_providers = specialized_providers(
            category=primary_filter.category,
            keywords=primary_filter.keywords
        )

    # 3. Return EVERYTHING so the Frontend has full context
    return {
        "ai_reply": ai_decision.reply_to_user,
        "providers": found_providers,

        # --- NEW FIELDS EXPOSED FOR FRONTEND ---
        "needs_clarification": ai_decision.needs_clarification,
        "clarification_question": ai_decision.clarification_question,
        "search_debug": ai_decision.search_filters  # Renamed 'search_filters' to 'search_debug' to match your interface
    }