"""
Stream Chat integration for real-time messaging
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from stream_chat import StreamChat
from typing import List, Optional
import os
import uuid
from .auth import get_current_user
from .models import UserInDB

# Initialize Stream Chat client
api_key = "xzt8q9ttynux"
api_secret = "bj8umd92pcusakq458hfyfmqewgm2efjbq7gzpnq5srqbs35kkawbp8n6s7nft6k"

stream_client = StreamChat(
    api_key=api_key,
    api_secret=api_secret
)

router = APIRouter(prefix="/api/chat", tags=["chat"])

class TokenRequest(BaseModel):
    user_id: str

class ChannelCreateRequest(BaseModel):
    channel_type: str = "messaging"
    channel_id: str
    members: List[str]
    name: Optional[str] = None

class MessageRequest(BaseModel):
    channel_id: str
    message: str
    user_id: str

@router.post("/auth-token")
async def get_stream_auth_token(
    current_user: UserInDB = Depends(get_current_user)
):
    """Generate Stream Chat token for user authentication"""
    try:
        user_id = str(current_user.id)
        token = stream_client.create_token(user_id)
        
        # Create or update user in Stream
        # Remove the role field to avoid the "role not defined" error
        stream_client.update_user({
            "id": user_id,
            "name": f"{current_user.first_name} {current_user.last_name}",
            "email": current_user.email
        })
        
        return {
            "token": token,
            "api_key": api_key,
            "user_id": user_id,
            "user_name": f"{current_user.first_name} {current_user.last_name}",
            "user_type": current_user.user_type
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token generation failed: {str(e)}"
        )

@router.post("/create-channel")
async def create_channel(
    request: ChannelCreateRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    """Create a new chat channel between users"""
    try:
        user_id = str(current_user.id)
        
        # Ensure current user is in the members list
        if user_id not in request.members:
            request.members.append(user_id)
        
        # Create channel - only use created_by_id, not both
        channel = stream_client.channel(
            request.channel_type, 
            request.channel_id,
            data={
                "name": request.name or f"Chat with {len(request.members)} members",
                "members": request.members,
                "created_by_id": user_id
            }
        )
        
        # Create the channel
        channel.create(user_id)
        
        return {
            "channel_id": request.channel_id,
            "channel_type": request.channel_type,
            "members": request.members,
            "name": request.name
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Channel creation failed: {str(e)}"
        )

@router.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """Upload file for chat messages"""
    
    # Validate file type
    ALLOWED_TYPES = {
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf", "text/plain", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
    
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: images, PDF, text, Word documents"
        )
    
    # Validate file size (10MB limit)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    file_size = 0
    content = await file.read()
    file_size = len(content)
    await file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB"
        )
    
    try:
        # Upload to Stream CDN
        file_content = content
        user_id = str(current_user.id)
        
        # Create a temporary file-like object
        class FileWrapper:
            def __init__(self, content, filename):
                self.content = content
                self.filename = filename
                self.position = 0
            
            def read(self, size=-1):
                if size == -1:
                    result = self.content[self.position:]
                    self.position = len(self.content)
                else:
                    result = self.content[self.position:self.position + size]
                    self.position += len(result)
                return result
            
            def seek(self, position, whence=0):
                if whence == 0:
                    self.position = position
                elif whence == 1:
                    self.position += position
                elif whence == 2:
                    self.position = len(self.content) + position
            
            def tell(self):
                return self.position
        
        file_wrapper = FileWrapper(file_content, file.filename)
        
        # Include the required 'name' and 'user' parameters
        response = stream_client.send_file(
            file_wrapper,
            name=file.filename,
            user={"id": user_id},
            content_type=file.content_type
        )
        
        return {
            "url": response["file"],
            "filename": file.filename,
            "size": file_size,
            "content_type": file.content_type
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )

@router.get("/channels")
async def get_user_channels(
    current_user: UserInDB = Depends(get_current_user)
):
    """Get all channels for the current user"""
    try:
        user_id = str(current_user.id)
        
        # Query channels where user is a member
        channels = stream_client.query_channels(
            filter_conditions={"members": {"$in": [user_id]}},
            sort=[{"last_message_at": -1}]
        )
        
        return {"channels": channels["channels"]}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch channels: {str(e)}"
        )

@router.post("/start-conversation")
async def start_conversation(
    vendor_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Start a conversation between a couple and a vendor"""
    try:
        user_id = str(current_user.id)
        
        # Create a unique channel ID
        channel_id = f"chat_{min(user_id, vendor_id)}_{max(user_id, vendor_id)}"
        
        # Create channel with both users - use channel_type instead of type
        channel = stream_client.channel(
            "messaging",
            channel_id,
            data={
                "name": f"Conversation with vendor",
                "members": [user_id, vendor_id],
                "created_by_id": user_id,
                "channel_type": "vendor_couple_chat"  # Changed from 'type' to 'channel_type'
            }
        )
        
        # Create the channel (will not recreate if exists)
        channel.create(user_id)
        
        return {
            "channel_id": channel_id,
            "members": [user_id, vendor_id],
            "message": "Conversation started successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start conversation: {str(e)}"
        )
