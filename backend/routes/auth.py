from fastapi import APIRouter, HTTPException, Depends
from models import UserCreate, UserLogin, Token, User
from auth import create_user, authenticate_user, create_access_token, get_current_user

router = APIRouter()

@router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        user = await create_user(user_data.username, user_data.email, user_data.password)
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user"""
    user = await authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user