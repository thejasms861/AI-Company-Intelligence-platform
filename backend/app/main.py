from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from app.routes.agent import router as agent_router
from app.routes.auth import router as auth_router
from app.middleware.error_handler import setup_exception_handlers
from dotenv import load_dotenv

# Load env variables
load_dotenv()

app = FastAPI(
    title="LangGraph Agent API",
    description="Scalable FastAPI backend for LangGraph Enterprise Research Agent",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend origin
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup exception handlers
setup_exception_handlers(app)

# Include Routers
app.include_router(agent_router)
app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "healthy"}

# Override OpenAPI schema to use alias names so Swagger shows real parameter names
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    # Force GoldenRecordModel to expose alias names as property keys
    golden = schema.get("components", {}).get("schemas", {}).get("GoldenRecordModel", {})
    if golden:
        new_props = {}
        for py_name, field_schema in golden.get("properties", {}).items():
            # Use the title (which is set from alias) as the key
            alias_name = field_schema.get("title", py_name)
            new_props[alias_name] = field_schema
        golden["properties"] = new_props
        schema["components"]["schemas"]["GoldenRecordModel"] = golden
    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
