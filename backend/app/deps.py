from app.db import get_db
from app.cache import get_cached, set_cached, get_cache_key
from fastapi import Depends
from sqlalchemy.orm import Session


def get_db_session():
    """Dependency for database session."""
    return Depends(get_db)


def get_cache():
    """Dependency for cache operations."""
    return {
        "get": get_cached,
        "set": set_cached,
        "key": get_cache_key,
    }


