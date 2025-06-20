from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime
import os
import uuid
import logging

# Simple FastAPI app for handling registration
app = FastAPI(title="Enosi Registration API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database connection
client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str = None
    user_type: str
    business_name: str = None  # For vendor accounts

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str = None
    user_type: str
    business_name: str = None
    created_at: datetime
    is_active: bool = True
    is_approved: bool = None  # For vendor accounts

# Helper functions
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Database connection
@app.on_event("startup")
async def startup_db_client():
    global client, db
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'enosi_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    
    logging.info("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()

# Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(user_data.password)
        
        user_doc = {
            "id": user_id,
            "email": user_data.email,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "phone": user_data.phone,
            "user_type": user_data.user_type,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        await db.users.insert_one(user_doc)
        
        # Create profile based on user type
        if user_data.user_type == "couple":
            couple_profile = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "partner_name": None,
                "wedding_date": None,
                "venue_location": None,
                "guest_count": None,
                "budget": None,
                "style_preferences": [],
                "favorite_vendors": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.couple_profiles.insert_one(couple_profile)
        
        # Return user response (without password)
        return UserResponse(
            id=user_id,
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            user_type=user_data.user_type,
            created_at=datetime.utcnow()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@app.post("/api/auth/login")
async def login_user(login_data: LoginRequest):
    try:
        # Find user
        user = await db.users.find_one({"email": login_data.email})
        if not user or not verify_password(login_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # For now, return a simple token (in production, use JWT)
        return {
            "access_token": f"token_{user['id']}",
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "user_type": user["user_type"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)