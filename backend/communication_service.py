import json
import logging
from typing import Dict, List, Optional, Set
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
from collections import defaultdict

from .models import ChatRoom, ChatMessage, Notification, NotificationPreferences

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections for real-time communication"""
    
    def __init__(self):
        # user_id -> set of websocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = defaultdict(set)
        # room_id -> set of user_ids
        self.room_participants: Dict[str, Set[str]] = defaultdict(set)
        
    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a user to WebSocket"""
        await websocket.accept()
        self.active_connections[user_id].add(websocket)
        logger.info(f"User {user_id} connected to WebSocket")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect a user from WebSocket"""
        self.active_connections[user_id].discard(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected from WebSocket")
    
    async def join_room(self, user_id: str, room_id: str):
        """Add user to a chat room"""
        self.room_participants[room_id].add(user_id)
        
        # Notify other participants that user joined
        await self.broadcast_to_room(room_id, {
            "type": "user_joined",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }, exclude_user=user_id)
    
    async def leave_room(self, user_id: str, room_id: str):
        """Remove user from a chat room"""
        self.room_participants[room_id].discard(user_id)
        if not self.room_participants[room_id]:
            del self.room_participants[room_id]
        
        # Notify other participants that user left
        await self.broadcast_to_room(room_id, {
            "type": "user_left",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }, exclude_user=user_id)
    
    async def send_personal_message(self, user_id: str, message: dict):
        """Send message to a specific user"""
        if user_id in self.active_connections:
            disconnected_sockets = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    disconnected_sockets.add(connection)
            
            # Clean up disconnected sockets
            for socket in disconnected_sockets:
                self.active_connections[user_id].discard(socket)
    
    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: str = None):
        """Broadcast message to all users in a room"""
        if room_id in self.room_participants:
            for user_id in self.room_participants[room_id]:
                if exclude_user and user_id == exclude_user:
                    continue
                await self.send_personal_message(user_id, message)
    
    def get_room_participants(self, room_id: str) -> List[str]:
        """Get list of participants in a room"""
        return list(self.room_participants.get(room_id, set()))
    
    def get_user_rooms(self, user_id: str) -> List[str]:
        """Get list of rooms a user is in"""
        rooms = []
        for room_id, participants in self.room_participants.items():
            if user_id in participants:
                rooms.append(room_id)
        return rooms

# Global connection manager instance
connection_manager = ConnectionManager()

class ChatService:
    """Service for managing chat functionality"""
    
    @staticmethod
    async def create_chat_room(
        db: AsyncIOMotorDatabase,
        couple_id: str,
        vendor_id: str,
        quote_id: str = None
    ) -> ChatRoom:
        """Create or get existing chat room between couple and vendor"""
        try:
            # Check if room already exists
            existing_room = await db.chat_rooms.find_one({
                "couple_id": couple_id,
                "vendor_id": vendor_id
            })
            
            if existing_room:
                return ChatRoom(**existing_room)
            
            # Create new room
            chat_room = ChatRoom(
                couple_id=couple_id,
                vendor_id=vendor_id,
                quote_id=quote_id
            )
            
            await db.chat_rooms.insert_one(chat_room.dict())
            return chat_room
            
        except Exception as e:
            logger.error(f"Failed to create chat room: {str(e)}")
            raise
    
    @staticmethod
    async def send_message(
        db: AsyncIOMotorDatabase,
        room_id: str,
        sender_id: str,
        sender_type: str,
        content: str,
        message_type: str = "text",
        attachments: List[str] = None
    ) -> ChatMessage:
        """Send a message in a chat room"""
        try:
            # Verify room exists and user has access
            room = await db.chat_rooms.find_one({"id": room_id})
            if not room:
                raise ValueError("Chat room not found")
            
            # Verify sender has access to room
            if sender_type == "couple":
                couple_profile = await db.couple_profiles.find_one({"user_id": sender_id})
                if not couple_profile or couple_profile["id"] != room["couple_id"]:
                    raise ValueError("Access denied")
            elif sender_type == "vendor":
                vendor_profile = await db.vendor_profiles.find_one({"user_id": sender_id})
                if not vendor_profile or vendor_profile["id"] != room["vendor_id"]:
                    raise ValueError("Access denied")
            
            # Create message
            message = ChatMessage(
                room_id=room_id,
                sender_id=sender_id,
                sender_type=sender_type,
                message_type=message_type,
                content=content,
                attachments=attachments or []
            )
            
            await db.chat_messages.insert_one(message.dict())
            
            # Update room's last message time
            await db.chat_rooms.update_one(
                {"id": room_id},
                {"$set": {"last_message_at": datetime.utcnow()}}
            )
            
            # Send real-time notification via WebSocket
            await ChatService._broadcast_message(room, message)
            
            # Send push notification to offline users
            await ChatService._send_offline_notifications(db, room, message)
            
            return message
            
        except Exception as e:
            logger.error(f"Failed to send message: {str(e)}")
            raise
    
    @staticmethod
    async def _broadcast_message(room: dict, message: ChatMessage):
        """Broadcast message to room participants via WebSocket"""
        try:
            message_data = {
                "type": "new_message",
                "message": message.dict(),
                "room_id": room["id"]
            }
            
            await connection_manager.broadcast_to_room(room["id"], message_data)
            
        except Exception as e:
            logger.error(f"Failed to broadcast message: {str(e)}")
    
    @staticmethod
    async def _send_offline_notifications(db: AsyncIOMotorDatabase, room: dict, message: ChatMessage):
        """Send notifications to users who are not online"""
        try:
            # Get room participants
            couple_user = await db.users.find_one({"id": {"$in": [
                profile["user_id"] for profile in await db.couple_profiles.find({"id": room["couple_id"]}).to_list(1)
            ]}})
            
            vendor_user = await db.users.find_one({"id": {"$in": [
                profile["user_id"] for profile in await db.vendor_profiles.find({"id": room["vendor_id"]}).to_list(1)
            ]}})
            
            # Determine recipient
            recipient = vendor_user if message.sender_type == "couple" else couple_user
            
            if recipient:
                # Check if user is online
                is_online = recipient["id"] in connection_manager.active_connections
                
                if not is_online:
                    # Send push notification
                    await NotificationService.send_notification(
                        db=db,
                        user_id=recipient["id"],
                        title="New Message",
                        message=f"You have a new message: {message.content[:50]}...",
                        notification_type="message",
                        related_id=message.id
                    )
                    
        except Exception as e:
            logger.error(f"Failed to send offline notifications: {str(e)}")
    
    @staticmethod
    async def get_user_chat_rooms(
        db: AsyncIOMotorDatabase,
        user_id: str,
        user_type: str
    ) -> List[Dict]:
        """Get all chat rooms for a user"""
        try:
            if user_type == "couple":
                couple_profile = await db.couple_profiles.find_one({"user_id": user_id})
                if not couple_profile:
                    return []
                
                rooms = await db.chat_rooms.find({
                    "couple_id": couple_profile["id"]
                }).sort("last_message_at", -1).to_list(100)
                
            elif user_type == "vendor":
                vendor_profile = await db.vendor_profiles.find_one({"user_id": user_id})
                if not vendor_profile:
                    return []
                
                rooms = await db.chat_rooms.find({
                    "vendor_id": vendor_profile["id"]
                }).sort("last_message_at", -1).to_list(100)
            else:
                return []
            
            # Enrich rooms with participant details and last message
            enriched_rooms = []
            for room in rooms:
                # Get participant details
                couple_profile = await db.couple_profiles.find_one({"id": room["couple_id"]})
                vendor_profile = await db.vendor_profiles.find_one({"id": room["vendor_id"]})
                
                if couple_profile and vendor_profile:
                    couple_user = await db.users.find_one({"id": couple_profile["user_id"]})
                    vendor_user = await db.users.find_one({"id": vendor_profile["user_id"]})
                    
                    # Get last message
                    last_message = await db.chat_messages.find_one(
                        {"room_id": room["id"]},
                        sort=[("created_at", -1)]
                    )
                    
                    # Get unread count for current user
                    unread_count = await db.chat_messages.count_documents({
                        "room_id": room["id"],
                        "sender_id": {"$ne": user_id},
                        "read_by": {"$ne": user_id}
                    })
                    
                    room["couple_user"] = couple_user
                    room["vendor_user"] = vendor_user
                    room["vendor_profile"] = vendor_profile
                    room["last_message"] = last_message
                    room["unread_count"] = unread_count
                    
                    enriched_rooms.append(room)
            
            return enriched_rooms
            
        except Exception as e:
            logger.error(f"Failed to get user chat rooms: {str(e)}")
            return []
    
    @staticmethod
    async def get_room_messages(
        db: AsyncIOMotorDatabase,
        room_id: str,
        user_id: str,
        limit: int = 50,
        before_id: str = None
    ) -> List[ChatMessage]:
        """Get messages from a chat room"""
        try:
            # Verify user has access to room
            room = await db.chat_rooms.find_one({"id": room_id})
            if not room:
                raise ValueError("Room not found")
            
            # Check user access
            has_access = False
            if room["couple_id"]:
                couple_profile = await db.couple_profiles.find_one({"id": room["couple_id"]})
                if couple_profile and couple_profile["user_id"] == user_id:
                    has_access = True
            
            if room["vendor_id"]:
                vendor_profile = await db.vendor_profiles.find_one({"id": room["vendor_id"]})
                if vendor_profile and vendor_profile["user_id"] == user_id:
                    has_access = True
            
            if not has_access:
                raise ValueError("Access denied")
            
            # Build query
            query = {"room_id": room_id}
            if before_id:
                before_message = await db.chat_messages.find_one({"id": before_id})
                if before_message:
                    query["created_at"] = {"$lt": before_message["created_at"]}
            
            # Get messages
            messages = await db.chat_messages.find(query).sort("created_at", -1).limit(limit).to_list(limit)
            
            # Mark messages as read by current user
            message_ids = [msg["id"] for msg in messages]
            await db.chat_messages.update_many(
                {"id": {"$in": message_ids}},
                {"$addToSet": {"read_by": user_id}}
            )
            
            # Return in chronological order
            messages.reverse()
            return [ChatMessage(**msg) for msg in messages]
            
        except Exception as e:
            logger.error(f"Failed to get room messages: {str(e)}")
            raise
    
    @staticmethod
    async def mark_messages_read(
        db: AsyncIOMotorDatabase,
        room_id: str,
        user_id: str,
        message_ids: List[str] = None
    ) -> bool:
        """Mark messages as read by user"""
        try:
            query = {"room_id": room_id}
            if message_ids:
                query["id"] = {"$in": message_ids}
            
            result = await db.chat_messages.update_many(
                query,
                {"$addToSet": {"read_by": user_id}}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Failed to mark messages as read: {str(e)}")
            return False

class NotificationService:
    """Service for managing notifications"""
    
    @staticmethod
    async def send_notification(
        db: AsyncIOMotorDatabase,
        user_id: str,
        title: str,
        message: str,
        notification_type: str,
        related_id: str = None
    ) -> Notification:
        """Send notification to a user"""
        try:
            # Get user's notification preferences
            preferences = await db.notification_preferences.find_one({"user_id": user_id})
            if not preferences:
                # Create default preferences
                preferences = NotificationPreferences(user_id=user_id)
                await db.notification_preferences.insert_one(preferences.dict())
                preferences = preferences.dict()
            
            # Create notification
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type,
                related_id=related_id
            )
            
            await db.notifications.insert_one(notification.dict())
            
            # Send real-time notification if user is online
            if user_id in connection_manager.active_connections:
                await connection_manager.send_personal_message(user_id, {
                    "type": "notification",
                    "notification": notification.dict()
                })
            
            # Send via other channels based on preferences
            sent_via = []
            
            if preferences.get("email_notifications", True):
                # TODO: Send email notification
                sent_via.append("email")
            
            if preferences.get("push_notifications", True):
                # TODO: Send push notification
                sent_via.append("push")
            
            # Update notification with delivery status
            await db.notifications.update_one(
                {"id": notification.id},
                {"$set": {"sent_via": sent_via}}
            )
            
            return notification
            
        except Exception as e:
            logger.error(f"Failed to send notification: {str(e)}")
            raise
    
    @staticmethod
    async def get_user_notifications(
        db: AsyncIOMotorDatabase,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """Get notifications for a user"""
        try:
            query = {"user_id": user_id}
            if unread_only:
                query["read"] = False
            
            notifications = await db.notifications.find(query).sort("created_at", -1).limit(limit).to_list(limit)
            return [Notification(**notif) for notif in notifications]
            
        except Exception as e:
            logger.error(f"Failed to get notifications: {str(e)}")
            return []
    
    @staticmethod
    async def mark_notification_read(
        db: AsyncIOMotorDatabase,
        notification_id: str,
        user_id: str
    ) -> bool:
        """Mark notification as read"""
        try:
            result = await db.notifications.update_one(
                {"id": notification_id, "user_id": user_id},
                {
                    "$set": {
                        "read": True,
                        "read_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Failed to mark notification as read: {str(e)}")
            return False
    
    @staticmethod
    async def get_unread_count(db: AsyncIOMotorDatabase, user_id: str) -> int:
        """Get count of unread notifications for a user"""
        try:
            count = await db.notifications.count_documents({
                "user_id": user_id,
                "read": False
            })
            return count
            
        except Exception as e:
            logger.error(f"Failed to get unread count: {str(e)}")
            return 0