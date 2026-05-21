import httpx
from typing import Dict, Any
from app.providers.base import BaseLLMProvider
from app.core.errors import RateLimitError, ProviderError, TimeoutError, FatalError
from app.config.settings import settings

class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        if not self.api_key:
            raise FatalError("GOOGLE_API_KEY is not set.")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    async def generate(self, prompt: str, model: str, **kwargs) -> str:
        url = self.base_url.format(model=model) + f"?key={self.api_key}"
        headers = {
            "Content-Type": "application/json"
        }
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    timeout=httpx.Timeout(60.0)
                )
                
            if response.status_code == 429:
                raise RateLimitError(f"Gemini Rate Limit: {response.text}")
            elif response.status_code == 401 or response.status_code == 403:
                raise FatalError(f"Gemini Auth Error: {response.text}")
            elif response.status_code >= 400:
                raise ProviderError(f"Gemini Error ({response.status_code}): {response.text}")
                
            data = response.json()
            
            # Gemini response extraction
            try:
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                return content
            except (KeyError, IndexError) as e:
                raise ProviderError(f"Gemini unexpected response format: {data}")
            
        except httpx.TimeoutException as e:
            raise TimeoutError(f"Gemini request timed out: {str(e)}")
        except httpx.RequestError as e:
            raise ProviderError(f"Gemini request failed: {str(e)}")
