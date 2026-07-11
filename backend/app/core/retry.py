from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)
import logging
from app.core.errors import RateLimitError, TimeoutError, RetryableError, ProviderError
from app.core.logger import logger

def get_retry_decorator(max_attempts=3):
    """
    Returns a Tenacity retry decorator configured to retry ONLY specific
    transient errors, with exponential backoff and jitter.
    """
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=(
            retry_if_exception_type(RateLimitError) |
            retry_if_exception_type(TimeoutError) |
            retry_if_exception_type(RetryableError) |
            retry_if_exception_type(ProviderError) # E.g., 500, 503
        ),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True
    )
