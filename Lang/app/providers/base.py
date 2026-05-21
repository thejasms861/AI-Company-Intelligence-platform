from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseLLMProvider(ABC):
    """Abstract base class for all LLM providers."""
    
    @abstractmethod
    async def generate(self, prompt: str, model: str, **kwargs) -> str:
        """
        Generates text using the specific provider.
        Must raise appropriate core.errors exceptions on failure.
        """
        pass
