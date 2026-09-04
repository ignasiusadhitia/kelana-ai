# ==============================================================================
# 6. UTILITIES: Rate Limiter (In-Memory Sliding Window for Cost & Quota Protection)
# ==============================================================================

import time
from collections import defaultdict
from threading import Lock
from typing import Optional
from fastapi import Request, HTTPException, status


class SlidingWindowRateLimiter:
    """
    Thread-safe in-memory sliding window rate limiter.
    Ensures zero external dependency overhead (no Redis required for standalone/dev/prod single-node),
    with automatic memory pruning to keep footprint under ~50KB.
    """

    def __init__(self, max_requests: int = 15, window_seconds: int = 60):
        """Initialize the sliding window rate limiter with request threshold and window duration."""
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._history: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()
        self._last_cleanup = time.time()

    def is_allowed(self, key: str) -> tuple[bool, int]:
        """
        Check if an action by `key` is permitted under current sliding window.
        Returns (is_allowed: bool, retry_after_seconds: int).
        """
        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            # Periodic cleanup of keys with no active requests in the window
            if now - self._last_cleanup > 300:
                self._cleanup(window_start)
                self._last_cleanup = now

            timestamps = self._history[key]
            # Prune timestamps outside the active window
            valid_timestamps = [ts for ts in timestamps if ts > window_start]
            self._history[key] = valid_timestamps

            if len(valid_timestamps) >= self.max_requests:
                oldest_timestamp = valid_timestamps[0]
                retry_after = max(1, int(oldest_timestamp + self.window_seconds - now))
                return False, retry_after

            # Record this request
            self._history[key].append(now)
            return True, 0

    def _cleanup(self, window_start: float):
        """Remove empty or fully expired keys to prevent memory leak."""
        stale_keys = [k for k, v in self._history.items() if not v or v[-1] <= window_start]
        for k in stale_keys:
            del self._history[k]

    def reset(self):
        """Reset all rate limiter state (useful for test isolation)."""
        with self._lock:
            self._history.clear()


# Global rate limiter instance for AI generation routes (15 requests/min per user/IP)
ai_rate_limiter = SlidingWindowRateLimiter(max_requests=15, window_seconds=60)


def check_ai_rate_limit(request: Request, user_id: Optional[int] = None) -> None:
    """
    FastAPI dependency helper to enforce rate limiting on expensive AI endpoints.
    Keyed by user_id if authenticated, or client host IP as fallback.
    """
    client_ip = request.client.host if request.client else "unknown"
    key = f"user:{user_id}" if user_id else f"ip:{client_ip}"

    allowed, retry_after = ai_rate_limiter.is_allowed(key)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded (15 AI requests/min). Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )
