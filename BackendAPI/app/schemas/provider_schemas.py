from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class ProviderSignupRequest(BaseModel):
    # Auth
    email: EmailStr
    password: str

    # Profile
    name: str
    phone_number: str
    category_id: str  # Category ObjectId as string
    description: str

    # Location (optional during signup, can be added later)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ProviderProfileUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    phone_number: Optional[str] = None
    tags: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DocumentUploadResponse(BaseModel):
    file_id: str
    filename: str
    type: str
    status: str = "pending"
    uploaded_at: datetime

class PortfolioUploadResponse(BaseModel):
    urls: List[str]

class DocumentVerificationRequest(BaseModel):
    document_index: int  # Index in business_documents array
    action: str  # "verify" or "reject"
    rejection_reason: Optional[str] = None

class ProviderResponse(BaseModel):
    id: str
    name: str
    email: str
    phone_number: str
    category: dict  # Category info
    description: str
    profile_image: Optional[str]
    portfolio_images: List[str]
    is_verified: bool
    rating: float
    tags: List[str]
    location: Optional[dict]

    # Document verification status summary
    total_documents: int
    verified_documents: int
    pending_documents: int
    rejected_documents: int

class AdminProviderDetailResponse(BaseModel):
    """Extended response for admin with document details"""
    id: str
    name: str
    email: str
    phone_number: str
    category: dict
    description: str
    profile_image: Optional[str]
    portfolio_images: List[str]
    is_verified: bool
    business_documents: List[dict]  # Full document details with status
    created_at: datetime
    updated_at: datetime
