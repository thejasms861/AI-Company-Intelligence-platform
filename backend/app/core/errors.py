class PipelineError(Exception):
    """Base class for all pipeline exceptions."""
    pass

class RateLimitError(PipelineError):
    """Raised when an API rate limit is hit."""
    pass

class ProviderError(PipelineError):
    """Raised when an upstream provider fails (e.g. 500, unsupported model)."""
    pass

class ValidationError(PipelineError):
    """Raised when the prompt, schema, or output fails validation."""
    pass

class TimeoutError(PipelineError):
    """Raised when an API call times out."""
    pass

class FatalError(PipelineError):
    """Raised for non-recoverable errors like invalid API keys."""
    pass

class RetryableError(PipelineError):
    """Generic error that can be retried."""
    pass
