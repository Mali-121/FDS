import redis
import json
import os
from typing import Optional, Any

REDIS_URL = os.getenv("REDIS_URL", "redis://cache:6379/0")

redis_client = redis.from_url(REDIS_URL, decode_responses=True)


def get_cache_key(prefix: str, **kwargs) -> str:
    """Generate cache key from prefix and kwargs."""
    key_parts = [prefix]
    for k, v in sorted(kwargs.items()):
        if v is not None:
            key_parts.append(f"{k}:{v}")
    return ":".join(key_parts)


def get_cached(key: str) -> Optional[Any]:
    """Get value from cache."""
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
    except Exception:
        pass
    return None


def set_cached(key: str, value: Any, expire: int = 300) -> None:
    """Set value in cache with expiration (default 5 minutes)."""
    try:
        redis_client.setex(key, expire, json.dumps(value, default=str))
    except Exception:
        pass


def invalidate_cache(pattern: str) -> None:
    """Invalidate cache keys matching pattern."""
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
    except Exception:
        pass


