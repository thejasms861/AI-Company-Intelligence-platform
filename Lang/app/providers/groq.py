import httpx
from typing import Dict, Any
from app.providers.base import BaseLLMProvider
from app.core.errors import RateLimitError, ProviderError, TimeoutError, FatalError
from app.config.settings import settings

class GroqProvider(BaseLLMProvider):
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        if not self.api_key:
            raise FatalError("GROQ_API_KEY is not set.")
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    async def generate(self, prompt: str, model: str, **kwargs) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [{"role": "system", "content": prompt}],
            **kwargs
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    json=payload,
                    headers=headers,
                    timeout=httpx.Timeout(60.0)
                )
                
            if response.status_code == 429:
                raise RateLimitError(f"Groq Rate Limit: {response.text}")
            elif response.status_code == 401 or response.status_code == 403:
                raise FatalError(f"Groq Auth Error: {response.text}")
            elif response.status_code >= 400:
                raise ProviderError(f"Groq Error ({response.status_code}): {response.text}")
                
            data = response.json()
            return data["choices"][0]["message"]["content"]
            
        except httpx.TimeoutException as e:
            raise TimeoutError(f"Groq request timed out: {str(e)}")
        except httpx.RequestError as e:
            raise ProviderError(f"Groq request failed: {str(e)}")
