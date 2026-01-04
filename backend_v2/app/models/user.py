from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    
# Properties to receive on item creation
class UserCreate(UserBase):
    email: EmailStr
    username: str
    password: str

# Properties to receive on item update
class UserUpdate(UserBase):
    password: Optional[str] = None

# Properties to return to client
class User(UserBase):
    id: Optional[str] = Field(None, alias="_id")
    is_active: bool = True
    level: int = 1
    exp: int = 0
    job_class: str = "Novice"
    gold: int = 0
    
    class Config:
        populate_by_name = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str
