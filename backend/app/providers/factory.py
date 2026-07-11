from app.providers.base import BaseLLMProvider
from app.providers.openai import OpenAIProvider
from app.providers.groq import GroqProvider
from app.providers.gemini import GeminiProvider
from app.core.retry import get_retry_decorator
from app.core.errors import ProviderError
from app.core.logger import logger

class ProviderFactory:
    def __init__(self):
        self.providers = {
            "gemini": GeminiProvider(),
            "grok": OpenAIProvider(),
            "groq": GroqProvider()
        }

    def get_provider(self, name: str) -> BaseLLMProvider:
        return self.providers.get(name.lower(), self.providers["groq"])

    @get_retry_decorator(max_attempts=3)
    async def generate_with_retry(self, provider_name: str, prompt: str, model: str, fallback_model: str = None) -> str:
        """
        Executes generation with smart retry on transient errors.
        If a ProviderError occurs (e.g. model unsupported) and fallback_model is provided,
        it will attempt to use the fallback_model.
        """
        provider = self.get_provider(provider_name)
        try:
            return await provider.generate(prompt=prompt, model=model)
        except ProviderError as e:
            if fallback_model:
                logger.warning(f"Provider {provider_name} failed with model {model}: {e}. Falling back to {fallback_model}.")
                return await provider.generate(prompt=prompt, model=fallback_model)
            else:
                raise

global_provider_factory = ProviderFactory()
