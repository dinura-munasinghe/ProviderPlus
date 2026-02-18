from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas.auth_schemas import UserSignupRequest, LoginRequest, TokenResponse
from ..services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignupRequest):
    """
    1. Checks if email exists
    2. hashes password
    3. saves user
    4. returns a login token immediately
    """
    result = await auth_service.register_new_user(user_data)
    return result

@router.post("/login")
async def login(login_data: LoginRequest):
    """
    1. verifies email and password
    2. returns a JWT token if valid
    """
    result = await auth_service.authenticate_user(
        email=str(login_data.email),
        password=login_data.password
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return result
