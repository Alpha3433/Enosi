import io
import uuid
import os
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from PIL import Image
# Try to import magic, but provide a fallback if it's not available
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
    print("Warning: python-magic library not available. File type detection will be limited.")
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, UploadFile
import logging

from .supabase_client import get_supabase, get_bucket_name, get_public_url, get_optimized_url
from .models import FileMetadata

logger = logging.getLogger(__name__)

class FileUploadService:
    """Service for handling file uploads with optimization and storage"""
    
    # File type configurations
    ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    ALLOWED_VIDEO_TYPES = ["video/mp4", "video/avi", "video/mov", "video/webm"]
    ALLOWED_DOCUMENT_TYPES = [
        "application/pdf", 
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ]
    
    MAX_IMAGE_SIZE = 50 * 1024 * 1024  # 50MB
    MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500MB
    MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10MB
    
    @staticmethod
    def validate_file_type(content_type: str, file_category: str) -> bool:
        """Validate file type based on category"""
        if file_category == "image":
            return content_type in FileUploadService.ALLOWED_IMAGE_TYPES
        elif file_category == "video":
            return content_type in FileUploadService.ALLOWED_VIDEO_TYPES
        elif file_category == "document":
            return content_type in FileUploadService.ALLOWED_DOCUMENT_TYPES
        return False
    
    @staticmethod
    def validate_file_size(file_size: int, file_category: str) -> bool:
        """Validate file size based on category"""
        if file_category == "image":
            return file_size <= FileUploadService.MAX_IMAGE_SIZE
        elif file_category == "video":
            return file_size <= FileUploadService.MAX_VIDEO_SIZE
        elif file_category == "document":
            return file_size <= FileUploadService.MAX_DOCUMENT_SIZE
        return False
    
    @staticmethod
    async def optimize_image(image_bytes: bytes, max_width: int = 1920, max_height: int = 1080) -> Tuple[bytes, Dict[str, Any]]:
        """Optimize image by resizing and converting to WebP"""
        try:
            # Open image
            img = Image.open(io.BytesIO(image_bytes))
            
            # Store original dimensions
            original_width, original_height = img.size
            
            # Convert to RGB if necessary (for WebP compatibility)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Calculate new dimensions while maintaining aspect ratio
            aspect_ratio = original_width / original_height
            if original_width > max_width or original_height > max_height:
                if aspect_ratio > 1:  # Landscape
                    new_width = min(max_width, original_width)
                    new_height = int(new_width / aspect_ratio)
                else:  # Portrait
                    new_height = min(max_height, original_height)
                    new_width = int(new_height * aspect_ratio)
                
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Save as WebP
            optimized_io = io.BytesIO()
            img.save(optimized_io, format="WEBP", quality=85, optimize=True)
            optimized_bytes = optimized_io.getvalue()
            
            # Create thumbnail
            thumbnail_img = img.copy()
            thumbnail_img.thumbnail((300, 300), Image.Resampling.LANCZOS)
            thumbnail_io = io.BytesIO()
            thumbnail_img.save(thumbnail_io, format="WEBP", quality=80)
            thumbnail_bytes = thumbnail_io.getvalue()
            
            metadata = {
                "original_size": len(image_bytes),
                "optimized_size": len(optimized_bytes),
                "original_dimensions": {"width": original_width, "height": original_height},
                "optimized_dimensions": {"width": img.width, "height": img.height},
                "compression_ratio": len(optimized_bytes) / len(image_bytes)
            }
            
            return optimized_bytes, thumbnail_bytes, metadata
            
        except Exception as e:
            logger.error(f"Image optimization failed: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid image file")
    
    @staticmethod
    def generate_file_path(original_filename: str, file_category: str, user_id: str = None) -> str:
        """Generate unique file path"""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        name, ext = os.path.splitext(original_filename)
        
        # Sanitize filename
        safe_name = "".join(c for c in name if c.isalnum() or c in ('-', '_')).rstrip()[:50]
        
        if file_category == "image" and ext.lower() in ['.jpg', '.jpeg', '.png', '.gif']:
            ext = '.webp'  # Convert to WebP
        
        if user_id:
            return f"{file_category}s/{user_id}/{timestamp}_{unique_id}_{safe_name}{ext}"
        else:
            return f"{file_category}s/{timestamp}_{unique_id}_{safe_name}{ext}"
    
    @staticmethod
    async def upload_file(
        file: UploadFile,
        file_category: str,
        user_id: str,
        db: AsyncIOMotorDatabase,
        tags: List[str] = None,
        metadata_extra: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Upload file to Supabase storage with optimization"""
        
        # Read file content
        contents = await file.read()
        file_size = len(contents)
        
        # Validate file type using python-magic for better detection
        try:
            mime_type = magic.from_buffer(contents, mime=True)
        except:
            mime_type = file.content_type
        
        # Validate file type and size
        if not FileUploadService.validate_file_type(mime_type, file_category):
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed types for {file_category}: {getattr(FileUploadService, f'ALLOWED_{file_category.upper()}_TYPES')}"
            )
        
        if not FileUploadService.validate_file_size(file_size, file_category):
            max_size = getattr(FileUploadService, f'MAX_{file_category.upper()}_SIZE')
            raise HTTPException(
                status_code=413, 
                detail=f"File too large. Maximum size for {file_category}: {max_size / (1024*1024):.1f}MB"
            )
        
        # Generate file path
        file_path = FileUploadService.generate_file_path(file.filename, file_category, user_id)
        
        try:
            supabase = get_supabase()
            bucket_name = get_bucket_name()
            
            upload_content = contents
            optimization_metadata = {}
            thumbnail_path = None
            
            # Optimize images
            if file_category == "image":
                optimized_content, thumbnail_content, opt_metadata = await FileUploadService.optimize_image(contents)
                upload_content = optimized_content
                optimization_metadata = opt_metadata
                
                # Upload thumbnail
                thumbnail_path = file_path.replace(f".{file_path.split('.')[-1]}", "_thumb.webp")
                supabase.storage.from_(bucket_name).upload(
                    path=thumbnail_path,
                    file=thumbnail_content,
                    file_options={"content-type": "image/webp"}
                )
            
            # Upload main file
            upload_response = supabase.storage.from_(bucket_name).upload(
                path=file_path,
                file=upload_content,
                file_options={"content-type": mime_type if file_category != "image" else "image/webp"}
            )
            
            # Create file metadata
            file_id = str(uuid.uuid4())
            file_metadata = FileMetadata(
                file_id=file_id,
                original_name=file.filename,
                file_path=file_path,
                file_type=file_category,
                mime_type=mime_type,
                size=len(upload_content),
                original_size=file_size,
                user_id=user_id,
                tags=tags or [],
                optimization_metadata=optimization_metadata,
                thumbnail_path=thumbnail_path,
                upload_date=datetime.utcnow(),
                **(metadata_extra or {})
            )
            
            # Save metadata to database
            await db.file_uploads.insert_one(file_metadata.dict())
            
            # Generate URLs
            public_url = get_public_url(file_path)
            thumbnail_url = get_public_url(thumbnail_path) if thumbnail_path else None
            
            return {
                "file_id": file_id,
                "file_path": file_path,
                "public_url": public_url,
                "thumbnail_url": thumbnail_url,
                "file_type": file_category,
                "mime_type": mime_type,
                "size": len(upload_content),
                "original_size": file_size,
                "optimization_metadata": optimization_metadata
            }
            
        except Exception as e:
            logger.error(f"File upload failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    
    @staticmethod
    async def delete_file(file_id: str, db: AsyncIOMotorDatabase) -> bool:
        """Delete file from storage and database"""
        try:
            # Get file metadata
            file_metadata = await db.file_uploads.find_one({"file_id": file_id})
            if not file_metadata:
                return False
            
            supabase = get_supabase()
            bucket_name = get_bucket_name()
            
            # Delete main file
            supabase.storage.from_(bucket_name).remove([file_metadata["file_path"]])
            
            # Delete thumbnail if exists
            if file_metadata.get("thumbnail_path"):
                supabase.storage.from_(bucket_name).remove([file_metadata["thumbnail_path"]])
            
            # Delete from database
            await db.file_uploads.delete_one({"file_id": file_id})
            
            return True
            
        except Exception as e:
            logger.error(f"File deletion failed: {str(e)}")
            return False
    
    @staticmethod
    async def get_user_files(
        user_id: str,
        file_category: str,
        db: AsyncIOMotorDatabase,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get files uploaded by a specific user"""
        try:
            query = {"user_id": user_id}
            if file_category:
                query["file_type"] = file_category
            
            cursor = db.file_uploads.find(query).sort("upload_date", -1).skip(offset).limit(limit)
            files = await cursor.to_list(length=limit)
            
            # Add public URLs
            for file_data in files:
                file_data["public_url"] = get_public_url(file_data["file_path"])
                if file_data.get("thumbnail_path"):
                    file_data["thumbnail_url"] = get_public_url(file_data["thumbnail_path"])
                else:
                    file_data["thumbnail_url"] = None
            
            return files
            
        except Exception as e:
            logger.error(f"Error fetching user files: {str(e)}")
            return []
    
    @staticmethod
    async def get_file_metadata(file_id: str, db: AsyncIOMotorDatabase) -> Optional[Dict[str, Any]]:
        """Get file metadata by ID"""
        try:
            file_metadata = await db.file_uploads.find_one({"file_id": file_id})
            if file_metadata:
                file_metadata["public_url"] = get_public_url(file_metadata["file_path"])
                if file_metadata.get("thumbnail_path"):
                    file_metadata["thumbnail_url"] = get_public_url(file_metadata["thumbnail_path"])
            return file_metadata
        except Exception as e:
            logger.error(f"Error fetching file metadata: {str(e)}")
            return None