from fastapi import HTTPException, status
from ..models.user_model import User, UserRole
from ..schemas.auth_schemas import UserSignupRequest, TokenResponse
from ..core.security import get_password_hash, verify_password, create_access_token


async def register_new_user(user_data: UserSignupRequest) -> TokenResponse:
    """
    handles the logic for signing up a new user
    """

    # 1. check for email
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # do not allow admin accounts to be created
    if user_data.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot be created publicly."
        )

    # hash the password
    hashed_pwd = get_password_hash(user_data.password)

    # create the user DB object
    new_user = User(
        email=user_data.email,
        password_hash=hashed_pwd,
        full_name=user_data.full_name,
        role=user_data.role
    )

    # save to mongoDB
    await new_user.insert()

    # auto-login: create a token immediately so they don't have to log in again
    access_token = create_access_token(
        data={"sub": str(new_user.id), "role": new_user.role}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=str(new_user.id),
        role=new_user.role,
        user_name=new_user.full_name
    )


async def authenticate_user(email: str, password: str):
    """
    handles the logic for logging in
    """

    # 1. find user by email
    user = await User.find_one(User.email == email)
    if not user:
        return None

    # 2. verify password by comparing with hash
    if not verify_password(password, user.password_hash):
        return None

    # 3. generate token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=str(user.id),
        role=user.role,
        user_name=user.full_name
    )
