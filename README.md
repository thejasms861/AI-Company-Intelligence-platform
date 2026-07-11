# Campus Compass 🧭

**What if every student had a personal placement expert and insider company intelligence?**

---

## The Story Behind This

Students preparing for placements often struggle with scattered information. Finding accurate, up-to-date details about a company's hiring process, recent news, technologies used, and company culture takes hours of research.

A student applying for a tech role might not know what specific skills the company is currently hiring for. They might not know if their resume is ATS-friendly for that specific company, or how to negotiate an offer based on current market trends.

**Millions of students. Most of them making crucial career decisions based on incomplete or outdated information.**

We thought — what if we could change that by bringing real-time company intelligence and personalized career guidance into one platform?

---

## What Campus Compass Actually Does

### You tell us a company name. We generate 163 data points.
Our **Generate Intelligence Engine** uses a multi-agent AI pipeline to scrape the internet, validate facts, and consolidate data. Enter a company name (e.g., "Google", "Blinkit"), and our system generates a "Golden Record" containing 163 parameters—from their core nature and employee size to total funding, recent acquisitions, and hiring trends.

### Need personalized guidance? Ask the Assistant.
Our **Role-Based Chatbot** adapts to who you are. If you're a student, it helps with interview prep, resume ATS checking, and offer optimization. If you're a recruiter or developer, it shifts its context to provide administrative insights or candidate management strategies. It's powered by ultra-fast LLMs to give you immediate answers.

### Optimize your offer and skills.
Use our **Offer Optimizer** to understand market standards and our **Skill Mapping** feature to align your current skills with what top companies are actually looking for.

---

## How We're Different

| What Exists | The Problem | What We Do |
|---|---|---|
| Glassdoor / AmbitionBox | Static, often outdated reviews | Real-time, AI-generated intelligence |
| Generic ChatGPT | Lacks specific platform context | Role-based, context-aware assistant |
| Manual Research | Takes hours to find reliable data | 163 parameters generated in minutes |
| Standard ATS Checkers | Generic scoring | Tailored to specific company profiles |

**Nobody is giving students a real-time, comprehensive intelligence platform for placements. Until now.**

---

## Tech Stack

```text
Frontend   →  React.js (Vite, TypeScript, TailwindCSS, shadcn/ui)
Backend    →  FastAPI (Python)
AI Agents  →  LangGraph for multi-agent orchestration
LLM Models →  Groq (Llama 3), Gemini, OpenAI (Fallback routing)
Search     →  DuckDuckGo Search (DDGS) for live web context
Database   →  Supabase (PostgreSQL)
```

A modern, fast, and scalable architecture designed for real-time AI processing.

---

## The Core AI Features

**Generate Company Intelligence** — A LangGraph `StateGraph` orchestrates a structured pipeline: Live Web Research ➡️ Data Validation ➡️ Consolidation ➡️ Intelligence Synthesis. It uses an async parallel research engine to query multiple LLMs and fetch live internet context, automatically retrying failed parameters using a smart regeneration router.

**Role-Based Chatbot** — A context-aware AI assistant that uses dynamic system prompts based on the user's role (Student, Developer, Recruiter). Built using FastAPI and Groq's Llama-3-70b-8192 model for rapid, intelligent conversational responses right inside the platform.

---

## Architecture

```text
User opens the app (React Frontend)
  → Requests Company Intelligence
    → FastAPI Backend triggers LangGraph Pipeline (Background Task)
      → Research Node scrapes live data (DDGS)
      → Parallel AI Engine queries Groq/Gemini/OpenAI
      → Golden Record is validated and saved to Supabase
        → Frontend polls status and displays the 163-parameter dashboard
```

---

## Run It Yourself

```bash
# Backend (LangGraph + FastAPI)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (React + Vite)
cd frontend
npm install
npm run dev
```

---

## Team

| Who | Role | What They Built |
|---|---|---|
| **Abuakr** | Frontend Lead | React UI, Dashboard, Polling Mechanism |
| **Ruksana Banu** | Backend Lead | FastAPI, Supabase Integration, Endpoints |
| **Pavan M** | DevOps | Jenkins CI/CD, Dockerization |
| **Thejas M S** | AI Lead | LangGraph multi-agent pipeline,  AI Chatbot integration |

---

*Built to empower the next generation of professionals with the intelligence they need to succeed.*
