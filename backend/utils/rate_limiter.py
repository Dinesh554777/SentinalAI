import time
from functools import wraps
from fastapi import Request, HTTPException, status
from utils.redis_client import redis_client


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int, prefix: str = "rl"):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.prefix = prefix

    def _get_key(self, identifier: str) -> str:
        return f"{self.prefix}:{identifier}"

    def _get_client_id(self, request: Request, email: str = None) -> str:
        ip = request.client.host if request.client else "unknown"
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            ip = forwarded.split(",")[0].strip()
        if email:
            return f"{ip}:{email}"
        return ip

    def check(self, request: Request, email: str = None):
        client_id = self._get_client_id(request, email)
        key = self._get_key(client_id)
        now = time.time()
        window_start = now - self.window_seconds

        pipe = redis_client.pipeline()
        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, self.window_seconds)
        results = pipe.execute()

        current_count = results[2]
        remaining = max(0, self.max_requests - current_count)

        ttl = redis_client.ttl(key)
        reset_at = int(now + ttl) if ttl > 0 else int(now + self.window_seconds)

        headers = {
            "X-RateLimit-Limit": str(self.max_requests),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(reset_at),
        }

        if current_count > self.max_requests:
            retry_after = max(1, reset_at - int(now))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Try again in {retry_after} seconds.",
                headers={**headers, "Retry-After": str(retry_after)},
            )

        return headers


login_limiter = RateLimiter(max_requests=5, window_seconds=60, prefix="rl:login")
otp_send_limiter = RateLimiter(max_requests=3, window_seconds=120, prefix="rl:otp:send")
otp_verify_limiter = RateLimiter(max_requests=5, window_seconds=60, prefix="rl:otp:verify")
signup_limiter = RateLimiter(max_requests=3, window_seconds=300, prefix="rl:signup")
register_limiter = RateLimiter(max_requests=3, window_seconds=300, prefix="rl:register")
