from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services import ai_analysis_service
from ..models.ai_schemas import AppointmentDetails, UpdatedSummary

router = APIRouter()

# --- INPUT MODELS (What the Frontend sends us) ---
class ChatLog(BaseModel):
    messages: str

class ReviewData(BaseModel):
    current_summary: str
    new_review: str
    reviewer_name: str

# --- ENDPOINT 1: Analyze Appointment ---
@router.post("/analyze-appointment", response_model=AppointmentDetails)
async def analyze_appointment_route(chat: ChatLog):
    # Call the REAL AI service
    result = ai_analysis_service.extract_appointment_details(chat.messages)
    return result

# --- ENDPOINT 2: Summarize Review ---
@router.post("/summarize-review", response_model=UpdatedSummary)
async def summarize_review_route(data: ReviewData):
    # Call the REAL AI service
    result = ai_analysis_service.generate_review_summary(data.current_summary, data.new_review)
    return result