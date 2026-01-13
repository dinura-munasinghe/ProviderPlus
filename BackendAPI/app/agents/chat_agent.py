import os
from google import genai
from dotenv import load_dotenv
from ..models.request_models import AgentResponse, SearchFilter
from ..data.categories import VALID_CATEGORIES

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)


def get_chat_response(user_message: str) -> AgentResponse:

    categories_str = str(VALID_CATEGORIES)
    try:
        response = client.models.generate_content(
            model = "gemini-2.0-flash-lite",
            contents = f"User message: {user_message}",
            config = {
                "system_instruction": f"""
                You are a Sri Lankan Service Assistant.
                LANGUAGE PROTOCOL (CRITICAL)
                - The user may speak English, Sinhala (e.g., "මට වතුර බට හදන කෙනෙක් ඕනේ"), or Singlish (e.g., "Mata plumber kenek one").
                
                RULE A: REPLY TO USER
                - IMPORTANT - Reply in the SAME language/script the user used. 
                - Example: User says "Mata...", you say "Hari, mama..."

                RULE B: DATA TRANSLATION (Internal Search)
                - The 'category' and 'keywords' MUST ALWAYS BE IN ENGLISH.
                - Never output Sinhala or Singlish in the 'keywords' list.
                - Example: Input "Wadu baas" -> Keywords ["Carpenter", "Woodwork"] (NOT "Wadu baas").
                
                VALID CATEGORIES LIST:
                {categories_str}   <--- DYNAMICALLY INJECTED HERE

                ### 2. MAPPING LOGIC
                - "Jayamangala Gatha" / "Choir" / "Magician" / "DJ" -> Map to 'Musicians' (or closest Entertainment category)
                - "Hut" / "Chairs" / "Tent" / "Setting up" -> Map to 'Furniture Rental'
                - "Baas" / "Wall building" -> Map to 'Masonry' (Construction only)
                - "Laborers" (for events) -> Map to 'Furniture Rental' or 'Event Planner'
                - "Alms Giving" (Dana) -> Map to 'Caterer' AND 'Event Planner'

                THE "HONESTY" PROTOCOL (Crucial)
                If a user asks for a service that truly DOES NOT FIT any category (e.g., "Magician", "Doctor", "Lawyer"):
                1. Do NOT map it to a random category.
                2. Do NOT create a search filter for it.
                3. MUST mention in 'reply_to_user' that this specific service is unavailable.
                
                ### 3. THE DECISION TREE
                SCENARIO A: VAGUE REQUEST ("I need help", "Party")
                - Action: Set needs_clarification=True.

                SCENARIO B: SPECIFIC JOB ("Fix my AC")
                - Action: Return ONE filter.

                SCENARIO C: COMPLEX EVENT ("Wedding", "Big Alms Giving")
                - Action: Return MULTIPLE filters covering the event's needs.
                - RULE: If Crowd > 50, always add 'Furniture Rental'.
                
                Example Output (Alms Giving + Music):
                [
                  {{category: "Caterer", keywords: ["Vegetarian"]}}, 
                  {{category: "Event Planner", keywords: ["Pirith"]}},
                  {{category: "Musicians", keywords: ["Jayamangala Gatha"]}}, 
                  {{category: "Furniture Rental", keywords: ["200 chairs"]}}
                ]
                """,
                "response_mime_type": "application/json",
                "response_schema": AgentResponse
            }
        )

        return response.parsed


    except Exception as e:
        print(f"Chat Agent Error: {e}")
        return AgentResponse(
            reply_to_user="I am having trouble connecting.",
            needs_clarification=False,
            search_filters=[]
        )
