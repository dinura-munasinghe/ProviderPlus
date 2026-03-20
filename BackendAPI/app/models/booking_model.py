from beanie import Document
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class BookingStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"

class Booking(Document):
    user_id: str
    provider_id: str
    conversation_id: str
    date: str
    time: str
    summary: str
    created_at: datetime = datetime.utcnow()
    status: BookingStatus = BookingStatus.pending

    user_latitude: Optional[float] = None
    user_longitude: Optional[float] = None

    sp_live_latitude: Optional[float] = None
    sp_live_longitude: Optional[float] = None
    sp_live_updated_at: Optional[datetime] = None

    class Settings:
        name = "bookings"


class BookingWithProvider(BaseModel):
    booking_id: str
    provider_id: str
    provider_name: str
    category_name: str
    summary: str
    date: str
    time: str
    status: str
    created_at: datetime
