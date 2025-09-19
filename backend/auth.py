from datetime import datetime, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import config
from models import User
from database import db

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc).timestamp() + (config.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    user_doc = await db.get_collection("users").find_one({"email": email})
    if user_doc is None:
        raise HTTPException(status_code=401, detail="User not found")

    return User(**user_doc)

async def authenticate_user(email: str, password: str) -> User:
    """Authenticate user with email and password"""
    user_doc = await db.get_collection("users").find_one({"email": email})
    if not user_doc:
        return None
    if not verify_password(password, user_doc["hashed_password"]):
        return None
    return User(**user_doc)

async def create_user(username: str, email: str, password: str) -> User:
    """Create a new user"""
    # Check if user already exists
    existing_user = await db.get_collection("users").find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    hashed_password = get_password_hash(password)
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_password
    )

    await db.get_collection("users").insert_one(user.dict())
    return user