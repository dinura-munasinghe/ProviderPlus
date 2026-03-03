"""
dashboard_service.py
─────────────────────
AI Overview service for the Provider Dashboard.
Uses the existing shared Gemini client from gemini_config.py.
Includes in-memory caching to avoid hitting Gemini rate limits.

"""

from ..core.gemini_config import client, MODEL_NAME
from datetime import datetime
from typing import Dict, Tuple

# ── In-Memory Cache ────────────────────────────────────────────
# Structure: { provider_id: (overview_text, timestamp) }
_overview_cache: Dict[str, Tuple[str, datetime]] = {}

# Cache duration in seconds (10 minutes)
CACHE_TTL_SECONDS = 600


def _get_time_of_day() -> str:
    hour = datetime.now().hour
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 17:
        return "afternoon"
    elif 17 <= hour < 20:
        return "evening"
    else:
        return "night"


def _get_cached_overview(provider_id: str) -> str | None:
    """
    Returns the cached overview if it exists and hasn't expired.
    Returns None if cache is missing or stale.
    """
    if provider_id in _overview_cache:
        cached_text, cached_time = _overview_cache[provider_id]
        elapsed = (datetime.now() - cached_time).total_seconds()
        if elapsed < CACHE_TTL_SECONDS:
            return cached_text
    return None


def _set_cached_overview(provider_id: str, overview: str) -> None:
    """Stores the overview in cache with the current timestamp."""
    _overview_cache[provider_id] = (overview, datetime.now())


def generate_provider_overview(
        provider_id: str,
        provider_name: str,
        job_role: str,
        completed_jobs_today: int = 0,
        upcoming_jobs: int = 0,
        rating: float = 0.0,
        country: str = "Sri Lanka",
) -> str:
    """
    Generates an AI-powered dashboard overview for a service provider.
    Returns cached version if available (within 10 min window).
    Only calls Gemini when cache is expired or empty.
    """

    # Check cache first
    cached = _get_cached_overview(provider_id)
    if cached is not None:
        print(f"[Dashboard AI]: Serving cached overview for {provider_id}")
        return cached

    # Cache miss — call Gemini
    print(f"[Dashboard AI]: Cache miss for {provider_id}, calling Gemini...")
    time_of_day = _get_time_of_day()

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=(
                f"Provider Name: {provider_name}\n"
                f"Job Role: {job_role}\n"
                f"Time of Day: {time_of_day}\n"
                f"Country: {country}\n"
                f"Completed Jobs Today: {completed_jobs_today}\n"
                f"Upcoming Jobs: {upcoming_jobs}\n"
                f"Current Rating: {rating}/5.0"
            ),
            config={
                "system_instruction": f"""
                You are an intelligent assistant for a service provider app called Provider+.
                Generate a brief, helpful dashboard overview (3-5 sentences max) for a service provider.

                Include a mix of the following (pick 2-3 that are most relevant):
                1. An interesting fact or tip related to their job role
                2. Where their service type is trending or most searched in {country}
                3. How often people have been searching for a {job_role} recently
                4. A motivational insight based on their rating or job completion
                5. A practical tip to improve their service or get more bookings

                Keep the tone warm, professional, and encouraging.
                Do NOT use markdown formatting or bullet points.
                Write in flowing sentences. Respond in plain text only.
                """,
            }
        )

        overview_text = response.text.strip()

        # Store in cache
        _set_cached_overview(provider_id, overview_text)

        return overview_text

    except Exception as e:
        print(f"[Dashboard AI Error]: {e}")
        # Fallback message so the app never breaks
        fallback = (
            f"Welcome back, {provider_name}! You have {upcoming_jobs} upcoming "
            f"jobs scheduled. Your {rating} star rating keeps you among the top "
            f"{job_role.lower()} providers. Keep up the great work!"
        )
        # Cache the fallback too so we don't keep hammering a broken API
        _set_cached_overview(provider_id, fallback)
        return fallback