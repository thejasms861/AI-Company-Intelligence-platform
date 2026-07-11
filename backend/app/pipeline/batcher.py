from typing import List
from app.config.settings import settings

def chunk_parameters(parameters: List[str], batch_size: int = settings.BATCH_SIZE) -> List[List[str]]:
    """
    Splits a list of parameter names into chunks for batch processing.
    In a fully dynamic token-based system, this would evaluate actual token lengths.
    For this implementation, fixed batch size is highly effective and simple.
    """
    return [parameters[i:i + batch_size] for i in range(0, len(parameters), batch_size)]
