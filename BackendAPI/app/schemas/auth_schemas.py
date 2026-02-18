from pydantic import BaseModel, EmailStr
from ..models.user_model import UserRole


class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    # we allow role here, but we will validate it strictly in the service
    role: UserRole = UserRole.CUSTOMER


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: str
    user_name: str
