import httpx
from typing import Dict, Any
from app.providers.base import BaseLLMProvider
from app.core.errors import RateLimitError, ProviderError, TimeoutError, FatalError
from app.config.settings import settings

class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        self.api_key = settings.GITHUB_TOKEN
        if not self.api_key:
            raise FatalError("GITHUB_TOKEN is not set.")
        self.base_url = "https://models.inference.ai.azure.com/chat/completions"

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
                raise RateLimitError(f"OpenAI/Grok Rate Limit: {response.text}")
            elif response.status_code == 401 or response.status_code == 403:
                raise FatalError(f"OpenAI/Grok Auth Error: {response.text}")
            elif response.status_code >= 400:
                raise ProviderError(f"OpenAI/Grok Error ({response.status_code}): {response.text}")
                
            data = response.json()
            return data["choices"][0]["message"]["content"]
            
        except httpx.TimeoutException as e:
            raise TimeoutError(f"OpenAI/Grok request timed out: {str(e)}")
        except httpx.RequestError as e:
            raise ProviderError(f"OpenAI/Grok request failed: {str(e)}")
