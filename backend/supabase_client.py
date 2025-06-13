import os
from supabase import create_client, Client
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Global Supabase client
_supabase_client: Optional[Client] = None

def get_supabase() -> Client:
    """Get Supabase client instance"""
    global _supabase_client
    
    if _supabase_client is None:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase URL and KEY must be provided in environment variables")
        
        _supabase_client = create_client(supabase_url, supabase_key)
        logger.info("Supabase client initialized")
    
    return _supabase_client

def get_bucket_name() -> str:
    """Get the Supabase bucket name"""
    return os.getenv("SUPABASE_BUCKET", "wedding-assets")

def get_public_url(file_path: str) -> str:
    """Get public URL for a file"""
    supabase_url = os.getenv("SUPABASE_URL")
    bucket_name = get_bucket_name()
    return f"{supabase_url}/storage/v1/object/public/{bucket_name}/{file_path}"

def get_optimized_url(file_path: str, width: int = 800, height: int = None) -> str:
    """Get optimized image URL with transformations"""
    base_url = get_public_url(file_path)
    params = f"?width={width}"
    if height:
        params += f"&height={height}"
    return f"{base_url}{params}"

async def create_bucket_if_not_exists():
    """Create the storage bucket if it doesn't exist"""
    try:
        supabase = get_supabase()
        bucket_name = get_bucket_name()
        
        # Try to get bucket info
        try:
            supabase.storage.get_bucket(bucket_name)
            logger.info(f"Bucket '{bucket_name}' already exists")
        except Exception:
            # Bucket doesn't exist, create it
            supabase.storage.create_bucket(bucket_name, {"public": True})
            logger.info(f"Created bucket '{bucket_name}'")
            
    except Exception as e:
        logger.error(f"Error managing bucket: {str(e)}")
        # Don't raise error as bucket might already exist