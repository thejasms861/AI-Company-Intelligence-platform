import os
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

def get_llms():
    """Initializes and returns the 3 required LLMs."""
    # Ensure these environment variables are set before execution:
    # GOOGLE_API_KEY, GITHUB_TOKEN (for GitHub Models), GROQ_API_KEY
    from dotenv import load_dotenv
    load_dotenv()
    
    llm_gemini = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    
    # Using GitHub Models Azure endpoint
    llm_grok = ChatOpenAI(
        model="grok-3", 
        base_url="https://models.inference.ai.azure.com", 
        api_key=os.environ.get("GITHUB_TOKEN")
    )
    
    llm_llama = ChatGroq(model="llama-3.3-70b-versatile")
    
    return {
        1: llm_gemini,
        2: llm_grok,
        3: llm_llama
    }
