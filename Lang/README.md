# 🔬 Enterprise Research Agent — FastAPI + LangGraph

A production-grade, multi-LLM research pipeline built with **LangGraph** and served via a **FastAPI** backend. Given a company name, it automatically researches and returns **163 structured intelligence parameters** using Gemini, Groq, and GPT-4o-mini in parallel.

---

## 🏗️ Architecture

```
POST /v1/agent/generate/sync
        │
        ▼
   [entry_node]  ──► Load schema parameters
        │
        ▼
 [research_node] ──► Parallel LLM calls (Gemini + Groq + GPT-4o-mini)
        │                  Rate-limited, chunked, retried
        ▼
[validation_node] ──► Cross-validate each parameter across 3 LLMs
        │
        ▼
[consolidation_node] ──► Pick best value, flag failures
        │
   ┌────┴────┐
   │ Router  │──► Retry (up to 3x for failed params)
   └────┬────┘
        │  (all pass OR max retries)
        ▼
  [save_node] ──► Write JSON + Markdown profile locally
        │
        ▼
   API Response ──► 163 parameters with real data
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Lang
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file (see `.env.example`):

```env
GOOGLE_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_token
LANGCHAIN_API_KEY=your_langsmith_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=company-research-agent
```

### 3. Run the API

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open **http://127.0.0.1:8000/docs** for the interactive Swagger UI.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/agent/generate/sync` | **Synchronous** — runs full pipeline, returns all 163 params |
| `POST` | `/v1/agent/generate` | **Async** — starts background job, returns `run_id` |
| `GET`  | `/v1/agent/status/{run_id}` | Poll for status + results of async run |
| `GET`  | `/v1/agent/status` | List all runs |
| `GET`  | `/health` | Health check |

### Example Request

```bash
curl -X POST http://127.0.0.1:8000/v1/agent/generate/sync \
  -H "Content-Type: application/json" \
  -d '{"company_name": "Microsoft"}'
```

### Example Response

```json
{
  "run_id": "abc-123",
  "status": "completed",
  "progress": 100,
  "company_name": "Microsoft",
  "golden_record": {
    "Company Name": "Microsoft Corporation",
    "Short Name": "Microsoft",
    "Employee Size": "228,000+",
    "Annual Revenues": "$211.9 billion",
    "CEO Name": "Satya Nadella",
    ...163 total parameters
  },
  "failed_parameters": [],
  "error": null
}
```

---

## 📋 The 163 Intelligence Parameters

Parameters span 20+ research categories:

| Category | Examples |
|----------|---------|
| Company Basics | Name, Headquarters, Year Founded |
| Financials | Revenue, Valuation, YoY Growth |
| People & Talent | Employee Size, Turnover, DEI |
| Leadership | CEO, Key Executives, Board |
| Digital Presence | Website, LinkedIn, Social Media |
| Competitive Landscape | Key Competitors, Technology Partners |
| Culture & Work | Work Culture, Manager Quality, Burnout Risk |
| Compensation | Fixed vs Variable Pay, ESOPs, Benefits |
| Innovation | AI/ML Adoption, R&D, Product Pipeline |
| ... and 15 more |

---

## 🧠 LLM Providers

| Provider | Model | Role |
|----------|-------|------|
| Google Gemini | `gemini-2.5-flash` | Primary researcher |
| Groq | `llama-3.3-70b-versatile` | Secondary researcher |
| OpenAI / Grok | `gpt-4o-mini` | Fallback researcher |

---

## 📁 Project Structure

```
app/
├── main.py              # FastAPI app entry point
├── graph.py             # LangGraph StateGraph definition
├── service.py           # Graph execution service
├── config/
│   ├── settings.py      # Pydantic settings
│   ├── prompts.py       # LLM prompt templates
│   └── schema.tsv       # 163-parameter schema definition
├── core/
│   ├── state.py         # AgentState TypedDict
│   ├── schema_parser.py # TSV schema parser
│   ├── rate_limiter.py  # Per-provider rate limiter
│   ├── errors.py        # Custom error classes
│   └── logger.py        # Structured logging
├── nodes/
│   ├── research.py      # Parallel LLM research node
│   ├── validation.py    # Cross-LLM validation
│   ├── consolidation.py # Golden record builder
│   ├── router.py        # Retry router
│   └── save.py          # JSON + Markdown writer
├── pipeline/
│   ├── engine.py        # Parallel research engine
│   ├── batcher.py       # Parameter chunker
│   └── validators.py    # JSON extraction + validation
├── providers/
│   ├── factory.py       # Provider factory + retry
│   ├── gemini.py        # Gemini provider
│   ├── groq.py          # Groq provider
│   └── openai.py        # OpenAI/Grok provider
├── models/
│   ├── api.py           # Request/Response Pydantic models
│   └── golden_record.py # 163-field GoldenRecordModel
├── routes/
│   └── agent.py         # FastAPI route handlers
├── storage/
│   └── run_store.py     # In-memory run state store
└── middleware/
    └── error_handler.py # Global exception handlers
```
