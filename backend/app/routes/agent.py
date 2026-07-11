import uuid
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from app.models.api import GenerateRequest, GenerateResponse, RunStatus
from app.storage.run_store import run_store
from app.service import agent_service
from pydantic import BaseModel
from app.providers.factory import global_provider_factory

class ChatRequest(BaseModel):
    message: str
    role: str
    username: str

router = APIRouter(prefix="/v1/agent", tags=["agent"])


@router.post("/generate", status_code=202)
async def generate_agent(request: GenerateRequest, background_tasks: BackgroundTasks):
    """Start a background research job and return a run_id to poll for status."""
    run_id = str(uuid.uuid4())
    run_store.create_run(run_id, request.company_name)
    background_tasks.add_task(agent_service.execute_graph, run_id, request.company_name)
    return JSONResponse(status_code=202, content={
        "run_id": run_id,
        "status": "queued",
        "message": f"Research started for '{request.company_name}'. Poll /v1/agent/status/{run_id} for results."
    })


@router.post("/generate/sync")
async def generate_agent_sync(request: GenerateRequest):
    """Run the full research pipeline synchronously and return all 163 parameters."""
    run_id = str(uuid.uuid4())
    run_store.create_run(run_id, request.company_name)
    await agent_service.execute_graph(run_id, request.company_name)
    run = run_store.get_run(run_id)
    if not run:
        raise HTTPException(status_code=500, detail="Run not found after execution.")
    return JSONResponse(content=run.to_dict())


@router.get("/status/{run_id}")
async def get_run_status(run_id: str):
    """Poll the status of an async research job. Returns the full golden_record when completed."""
    run = run_store.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run ID '{run_id}' not found.")
    return JSONResponse(content=run.to_dict())


@router.get("/status")
async def get_all_statuses():
    """List all active and completed research runs."""
    return JSONResponse(content=[r.to_dict() for r in run_store.get_all()])

@router.post("/chat")
async def chat_assistant(request: ChatRequest):
    """Role-based chatbot for Placement Intelligence."""
    
    # Role-based context
    context = ""
    if request.role == "student":
        context = "You are an assistant for a student on the Campus Compass platform. Help them with placement preparation, viewing analytics, offer optimization, resume checking (ATS), and career guidance. Limit technical admin details."
    elif request.role == "developer":
        context = "You are an assistant for a Developer/Admin. Provide technical details, database schema info, how LangGraph research works, and debugging steps if needed."
    else:
        context = "You are a Recruiter assistant. Help with managing candidates, viewing company intelligence, and analyzing trends."

    system_prompt = f"""
    {context}
    You are the 'Placement Intelligence Assistant' inside the 'Campus Compass' web application.
    The app has these features: Explore, Skill Mapping, Offer Optimizer, Interview Vault, Resume ATS, Company Updates, and generating company intelligence using LangGraph.
    Answer the user politely and concisely. 
    User message: {request.message}
    """

    try:
        reply = await global_provider_factory.generate_with_retry("groq", system_prompt, "llama-3.1-70b-versatile")
        return JSONResponse(content={"reply": reply})
    except Exception as e:
        return JSONResponse(status_code=500, content={"reply": f"Sorry, I encountered an error: {str(e)}"})
