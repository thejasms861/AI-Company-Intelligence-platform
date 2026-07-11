import asyncio
import time
from app.config.settings import settings

class ProviderRateLimiter:
    def __init__(self, rpm: int, max_concurrent: int):
        self.rpm = rpm
        self.max_concurrent = max_concurrent
        self.tokens_available = rpm
        self.last_update = time.monotonic()
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.lock = asyncio.Lock()

    async def acquire(self):
        """Wait for concurrency slots and RPM bucket."""
        await self.semaphore.acquire()
        try:
            while True:
                async with self.lock:
                    now = time.monotonic()
                    elapsed = now - self.last_update
                    
                    # Replenish tokens based on elapsed time
                    replenish = elapsed * (self.rpm / 60.0)
                    self.tokens_available = min(self.rpm, self.tokens_available + replenish)
                    self.last_update = now

                    if self.tokens_available >= 1:
                        self.tokens_available -= 1
                        return
                
                # If no tokens available, wait a bit and try again
                await asyncio.sleep(0.1)
        except Exception:
            self.semaphore.release()
            raise

    def release(self):
        self.semaphore.release()


class RateLimiterRegistry:
    def __init__(self):
        self._limiters = {
            "gemini": ProviderRateLimiter(settings.GEMINI_RPM, settings.MAX_CONCURRENT_WORKERS),
            "grok": ProviderRateLimiter(settings.OPENAI_RPM, settings.MAX_CONCURRENT_WORKERS),
            "groq": ProviderRateLimiter(settings.GROQ_RPM, settings.MAX_CONCURRENT_WORKERS),
        }
        
    def get_limiter(self, provider_name: str) -> ProviderRateLimiter:
        return self._limiters.get(provider_name.lower(), self._limiters["groq"])

global_rate_limiter = RateLimiterRegistry()
