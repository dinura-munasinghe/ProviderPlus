from beanie import Document, Link
from typing import List, Optional
from pydantic import Field
from datetime import datetime
from .category_model import Category


class BusinessDocument(dict):
    """
    Structure for business  documents stored in GridFS
    """
    # Example structure:
    # {
    #     "file_id": "gridfs_object_id",
    #     "filename": "business_license.pdf",
    #     "type": "business_license",  # or "certification", "id_proof"
    #     "status": "pending",  # "pending", "verified", "rejected"
    #     "uploaded_at": datetime,
    #     "verified_at": datetime or None,
    #     "rejection_reason": "Document unclear" or None
    # }
    pass


class Provider(Document):
    name: str
    category: Link[Category]
    description: str
    profile_image: Optional[str] = None
    tags: List[str] = []
    rating: float = 0.0

    phone_number: str

    location: Optional[dict] = None

    user_id: str

    is_verified: bool = False

    business_documents: List[dict] = []

    portfolio_images: List[str] = []

    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "providers"
