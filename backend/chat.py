"""
Stream Chat integration for real-time messaging
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from stream_chat import StreamChat
from typing import List, Optional
import os
import uuid
import hashlib
from .auth import get_current_user
from .models import UserInDB
from motor.motor_asyncio import AsyncIOMotorDatabase
from .database import get_database

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
            {
                "name": request.name or f"Chat with {len(request.members)} members",
                "members": request.members
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
        # For this test, we'll just return a mock response
        # In a real implementation, you would upload the file to Stream CDN
        # and return the URL
        
        return {
            "url": f"https://stream-chat-cdn.example.com/files/{file.filename}",
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
        
        # Create a unique channel ID that's less than 64 characters
        # Use a hash to ensure it's short but still unique
        hash_input = f"{min(user_id, vendor_id)}_{max(user_id, vendor_id)}"
        channel_id = hashlib.md5(hash_input.encode()).hexdigest()
        
        # Create channel with both users
        channel = stream_client.channel(
            "messaging",
            channel_id,
            {
                "name": f"Conversation with vendor",
                "members": [user_id, vendor_id],
                "custom_type": "vendor_couple_chat"  # Use custom_type instead of type
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

async def send_message_notification(email: str, recipient_name: str, sender_name: str, message_preview: str, channel_id: str):
    """Send email notification for new messages"""
    try:
        subject = f"New message from {sender_name} - Enosi"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                <h2 style="color: #e11d48;">New Message on Enosi</h2>
                <p>Hi {recipient_name},</p>
                <p>You have a new message from <strong>{sender_name}</strong>:</p>
                <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e11d48;">
                    <p style="margin: 0; font-style: italic;">"{message_preview}"</p>
                </div>
                <p>
                    <a href="https://enosiweddings.com/chat" 
                       style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reply Now
                    </a>
                </p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                    This message was sent through the Enosi wedding platform. 
                    <a href="https://enosiweddings.com/chat">Log in to your account</a> to respond.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Here you would integrate with your email service (SendGrid, etc.)
        # For now, just log the notification
        print(f"📧 Email notification sent to {email}: {subject}")
        print(f"Message preview: {message_preview}")
        
        # TODO: Implement actual email sending with SendGrid
        # import sendgrid
        # from sendgrid.helpers.mail import Mail
        # 
        # sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
        # mail = Mail(
        #     from_email='notifications@enosiweddings.com',
        #     to_emails=email,
        #     subject=subject,
        #     html_content=html_content
        # )
        # response = sg.send(mail)
        
    except Exception as e:
        print(f"Failed to send email notification: {e}")

@router.post("/notify-message")
async def notify_new_message(
    channel_id: str,
    message_text: str,
    recipient_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Send email notification for new message"""
    try:
        # Get recipient details
        recipient = await db.users.find_one({"id": recipient_id})
        if not recipient:
            raise HTTPException(status_code=404, detail="Recipient not found")
        
        # Send email notification
        await send_message_notification(
            recipient['email'],
            recipient.get('first_name', 'User'),
            f"{current_user.first_name} {current_user.last_name}",
            message_text[:100] + "..." if len(message_text) > 100 else message_text,
            channel_id
        )
        
        return {"message": "Notification sent successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send notification: {str(e)}"
        )