"""
Rate-limiting helper for AI views.
Uses Django's cache framework to enforce per-restaurant per-endpoint limits.
"""
from django.core.cache import cache


def check_rate_limit(restaurant_id: int, action: str, max_calls: int = 20, window_seconds: int = 3600) -> bool:
    """
    Returns True if the call is allowed, False if rate-limited.
    Defaults: 20 calls per hour per restaurant per action.
    """
    key = f"ai_rate_limit:{restaurant_id}:{action}"
    count = cache.get(key, 0)
    if count >= max_calls:
        return False
    cache.set(key, count + 1, timeout=window_seconds)
    return True
