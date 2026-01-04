from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core import security
from app.core.config import get_settings
from app.db.mongodb import get_database
from app.models.user import UserCreate, User, Token

router = APIRouter()
settings = get_settings()

@router.post("/register", response_model=User)
async def register_user(
    *,
    db = Depends(get_database),
    user_in: UserCreate
) -> Any:
    """
    Create new user.
    """
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    existing_username = await db.users.find_one({"username": user_in.username})
    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="The username is already taken.",
        )
        
    user_dict = user_in.model_dump()
    user_dict["hashed_password"] = security.get_password_hash(user_dict.pop("password"))
    user_dict["created_at"] = datetime.utcnow()
    
    # Defaults
    user_dict.update({
        "level": 1,
        "exp": 0,
        "exp_required": 100,
        "stats": {
            "strength": 5,
            "agility": 5,
            "intelligence": 5,
            "stamina": 5,
            "health": 100,
            "max_health": 100,
            "max_stamina": 100
        },
        "gold": 0,
        "job_class": "Novice"
    })
    
    new_user = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    
    return User(**created_user, _id=str(created_user["_id"]))

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    db = Depends(get_database),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await db.users.find_one({"username": form_data.username})
    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user["_id"], expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
