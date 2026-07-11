from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
import jwt
import bcrypt
import json
import os
from datetime import datetime, timedelta

router = APIRouter()

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "super-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 hours

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str

import uuid

class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str = "student"

# Mock Database for users
# In a real app, this would be in Supabase, but constraints forbid modifying DB structure.
USERS_DB = {
    "student1@pes.edu": {
        "id": "STU001",
        "username": "student1@pes.edu",
        "password_hash": bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "role": "student"
    },
    "admin": {
        "id": "ADM001",
        "username": "admin",
        "password_hash": bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "role": "admin"
    },
    "dev_master": {
        "id": "DEV001",
        "username": "dev_master",
        "password_hash": bcrypt.hashpw("devsecret123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "role": "developer"
    }
}

USERS_FILE = os.path.join(os.path.dirname(__file__), "..", "storage", "users.json")

def load_users():
    global USERS_DB
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, "r") as f:
                loaded = json.load(f)
                USERS_DB.update(loaded)
        except Exception as e:
            print(f"Error loading users: {e}")

def save_users():
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, "w") as f:
        json.dump(USERS_DB, f, indent=4)

load_users()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=Token)
async def login(req: LoginRequest):
    user = USERS_DB.get(req.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not bcrypt.checkpw(req.password.encode('utf-8'), user["password_hash"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT
    token_data = {"sub": user["id"], "role": user["role"], "username": user["username"]}
    access_token = create_access_token(token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user["role"],
        "user_id": user["id"]
    }

@router.post("/register", response_model=Token)
async def register(req: RegisterRequest):
    if req.username in USERS_DB:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # We only allow registering students dynamically
    if req.role != "student":
        raise HTTPException(status_code=403, detail="Can only register students")

    user_id = f"STU{len(USERS_DB) + 100}"
    password_hash = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    USERS_DB[req.username] = {
        "id": user_id,
        "username": req.username,
        "password_hash": password_hash,
        "role": "student"
    }
    
    save_users()

    # Create JWT automatically log them in
    token_data = {"sub": user_id, "role": "student", "username": req.username}
    access_token = create_access_token(token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "student",
        "user_id": user_id
    }

@router.get("/me")
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"user_id": payload.get("sub"), "role": payload.get("role"), "username": payload.get("username")}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
