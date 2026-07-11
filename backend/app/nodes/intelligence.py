import json
from typing import Dict, Any
from app.core.state import AgentState
from app.core.logger import logger
from app.providers.factory import global_provider_factory
import asyncio

async def run_intelligence(golden_record: Dict[str, Any], company_name: str) -> Dict[str, Any]:
    prompt = f"""
    You are a Senior AI Product Architect and Data Intelligence Specialist.
    Based on your deep industry knowledge of {company_name}, analyze the company's campus hiring behavior and placement profile.

    Perform two tasks:
    1. Categorize the company into exactly one of these tiers based on typical campus hiring volume, selectivity, and compensation:
       - Mass Recruiter
       - Mid-Tier Recruiter
       - Premium Niche
       - Elite Dream Company
       Provide a short 'reasoning' for why you chose this tier (psychologically helping students set realistic expectations and allocate prep effort).
    2. Estimate the expected hiring volume FROM A SINGLE TYPICAL COLLEGE CAMPUS, broken down by college tier (Tier 1 like IITs/NITs/BITS, Tier 2 like top state colleges, Tier 3 like local engineering colleges). Use rough ranges like "10-20 students", "1-3 students", or "Rarely hires". Also assign relevant badges (e.g., "High Volume Campus Hiring", "Highly Selective", "Top Tier Pay", "Stable Backup").

    Output MUST be valid JSON in this exact structure, with no markdown formatting or extra text:
    {{
        "company_tier": "Elite Dream Company",
        "reasoning": "...",
        "campus_hiring_volumes": {{
            "tier_1": "...",
            "tier_2": "...",
            "tier_3": "..."
        }},
        "badges": ["badge1", "badge2"]
    }}
    """
    
    try:
        response_text = await global_provider_factory.generate_with_retry(
            provider_name="groq",
            prompt=prompt,
            model="llama-3.1-8b-instant",
            fallback_model="mixtral-8x7b-32768"
        )
        
        import re
        # Find the first '{' and the last '}' to extract the JSON object
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
            
        data = json.loads(response_text.strip())
        return data
    except Exception as e:
        logger.error(f"Intelligence generation failed for {company_name}: {e}")
        return {
            "company_tier": "Unknown",
            "reasoning": "Failed to analyze data.",
            "estimated_annual_hiring_volume": "Unknown",
            "badges": []
        }

from duckduckgo_search import DDGS

def get_realtime_context(name):
    try:
        with DDGS() as ddgs:
            results = ddgs.text(f"{name} company layoffs 2023 2024 2025 2026", max_results=5)
            context = "\n".join([f"- {res.get('title')}: {res.get('body')}" for res in results])
            return context
    except Exception as e:
        return ""

async def run_layoffs_analysis(company_name: str) -> Dict[str, Any]:
    realtime_context = get_realtime_context(company_name)
    
    prompt = f"""
    You are an expert tech industry analyst. Provide the historical layoff data for the company "{company_name}" ONLY for the last 5 years (2021 to 2026).
    
    Here is real-time search data from the internet about their recent layoffs (use this to include 2024, 2025, and 2026 data if it exists):
    {realtime_context}
    
    If the company has never had significant public layoffs in the last 5 years, return an empty array for layoff_events and set has_layoffs to false.
    If they have, list each major event with the year, the approximate number of employees laid off (as an integer, not a string), and the roles affected.
    
    Output MUST be valid JSON in this exact structure:
    {{
        "has_layoffs": true,
        "layoff_events": [
            {{ "year": 2022, "number_laid_off": 150, "roles_affected": "Engineering, Recruiting" }},
            {{ "year": 2024, "number_laid_off": 800, "roles_affected": "Sales, Operations" }}
        ]
    }}
    """
    try:
        response_text = await global_provider_factory.generate_with_retry(
            provider_name="groq",
            prompt=prompt,
            model="llama-3.1-8b-instant",
            fallback_model="mixtral-8x7b-32768"
        )
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
        return json.loads(response_text.strip())
    except Exception as e:
        logger.error(f"Layoffs generation failed for {company_name}: {e}")
        return {"has_layoffs": False, "layoff_events": []}
    logger.info(f"[Phase 4.5] INTELLIGENCE AGENT: Classifying company {state['company_name']}")
    
    golden_record = state.get("golden_record", {})
    company_name = state.get("company_name", "Unknown Company")
    
    # Run async function in sync wrapper since langgraph nodes can be sync
    # If the workflow is strictly async, we should await it, but LangGraph handles sync/async seamlessly if defined as async def.
    # We will make this node async.
    
    # Actually, we can define the node as async def. Let's do that.
    pass

async def run_roadmap_analysis(company_name: str) -> Dict[str, Any]:
    from duckduckgo_search import DDGS
    realtime_context = ""
    try:
        with DDGS() as ddgs:
            results = ddgs.text(f"{company_name} interview experience difficulty software engineer preparation", max_results=3)
            realtime_context = "\n".join([f"- {res.get('title')}: {res.get('body')}" for res in results])
    except Exception as e:
        logger.error(f"DDGS error in roadmap: {e}")

    prompt = f"""
    You are an expert technical recruiter and interview coach. Provide a "Skills & Effort Required Roadmap" for a candidate preparing to interview at {company_name}.
    
    Here is real-time internet context about their interview difficulty and preparation:
    {realtime_context}
    
    1. Generate skill ratings out of 10 for: DSA, Aptitude, Problem Solving, Communication, Projects, Core Subjects, Coding, System Design.
    2. Generate: Overall Effort Rating (out of 10), Company Difficulty Rating (e.g. "Easy", "Medium", "Hard", "Extreme"), Company Type ("Product-based" or "Service-based"), Preparation Focus Areas (list of 3-4 strings), Estimated Preparation Time (e.g. "3-6 months").
    
    Product-based companies should generally have higher DSA and problem-solving ratings. Service-based companies should generally have higher aptitude and communication ratings.
    
    Output MUST be valid JSON in this exact structure:
    {{
        "skills": {{
            "dsa": 9,
            "aptitude": 4,
            "problem_solving": 9,
            "communication": 6,
            "projects": 8,
            "core_subjects": 7,
            "coding": 9,
            "system_design": 8
        }},
        "overall_effort": 9,
        "difficulty": "Hard",
        "company_type": "Product-based",
        "focus_areas": ["Dynamic Programming", "System Design", "Behavioral"],
        "estimated_prep_time": "3-6 months"
    }}
    """
    try:
        response_text = await global_provider_factory.generate_with_retry(
            provider_name="gemini",
            prompt=prompt,
            model="gemini-flash-latest",
            fallback_model="gemini-3.5-flash"
        )
        import re
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
        if match:
            response_text = match.group(1)
        else:
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if match:
                response_text = match.group(0)
        data = json.loads(response_text.strip())
        service_keywords = [
            "infosys", "capgemini", "tcs", "tata consultancy", "wipro", 
            "publicis", "pwc", "pricewaterhouse", "cognizant", "prodapt", 
            "quest global", "accenture", "lti", "mindtree", "ltimindtree", 
            "hcl", "tech mahindra", "dxc", "ey", "deloitte", "kpmg", "zenken"
        ]
        comp_lower = company_name.lower()
        if any(kw in comp_lower for kw in service_keywords):
            data["company_type"] = "Service-based"
        else:
            curr_type = str(data.get("company_type", "")).lower()
            if "service" in curr_type:
                data["company_type"] = "Service-based"
            else:
                data["company_type"] = "Product-based"
        return data
    except Exception as e:
        logger.error(f"Roadmap generation failed for {company_name}: {e}")
        return {}

def clean_json_string(s: str) -> str:
    import re
    # Remove single line comments
    s = re.sub(r'//.*$', '', s, flags=re.MULTILINE)
    # Remove trailing commas before closing braces/brackets
    s = re.sub(r',\s*([\]}])', r'\1', s)
    # Replace smart quotes
    s = s.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    return s

async def run_innovex_analysis(company_name: str, category: str, nature: str) -> Dict[str, Any]:
    from duckduckgo_search import DDGS
    realtime_context = ""
    try:
        with DDGS() as ddgs:
            results = ddgs.text(f"{company_name} tech stack innovation projects R&D products", max_results=3)
            realtime_context = "\n".join([f"- {res.get('title')}: {res.get('body')}" for res in results])
    except Exception as e:
        logger.error(f"DDGS error in innovex: {e}")

    prompt = f"""
    You are a Senior Deep-tech Innovation Architect.
    Research and analyze the technological innovation ecosystem of "{company_name}" (Category: {category}, Nature: {nature}).
    
    Here is real-time search context about their recent tech innovation/stack/projects:
    {realtime_context}
    
    Generate detailed, company-specific information matching this exact schema structure:
    {{
        "innovx_master": {{
            "company_name": "{company_name}",
            "industry": "{category}",
            "sub_industry": "<Insert specific sub-industry matching {company_name}>",
            "core_business_model": "{nature}",
            "target_market": "<Insert specific target market (e.g. Enterprise, Developers, Consumers, or B2B/B2C)>",
            "geographic_focus": "<Insert geographic focus (e.g. Global, regional, local)>"
        }},
        "industry_trends": [
            {{
                "trend_name": "<Insert a highly specific industry trend affecting this company>",
                "trend_description": "<Insert description of how this trend affects {company_name}'s specific products or services>",
                "time_horizon_years": 3,
                "trend_drivers": ["<Insert specific driver 1>", "<Insert specific driver 2>"],
                "impact_areas": ["<Insert impact area 1>", "<Insert impact area 2>"],
                "strategic_importance": "High"
            }},
            {{
                "trend_name": "<Insert another specific industry trend affecting this company>",
                "trend_description": "<Insert description of how this trend affects {company_name}'s specific products or services>",
                "time_horizon_years": 5,
                "trend_drivers": ["<Insert driver 1>", "<Insert driver 2>"],
                "impact_areas": ["<Insert impact area 1>", "<Insert impact area 2>"],
                "strategic_importance": "Critical"
            }}
        ],
        "strategic_pillars": [
            {{
                "cto_vision_statement": "<CTO vision statement tailored specifically for {company_name}'s domain (e.g., streaming, beverage manufacturing, semiconductors, retail)>",
                "pillar_name": "<Insert strategic pillar name (e.g. Smart Supply Chain, High-Throughput Edge Chips, or Decentralized Finance)>",
                "pillar_description": "<Insert description of how they are executing this strategic pillar>",
                "focus_area": "<Insert focus area>",
                "key_technologies": ["<Tech 1>", "<Tech 2>", "<Tech 3>", "<Tech 4>"],
                "strategic_risks": "<Insert strategic risk>",
                "strategic_assumptions": "<Insert strategic assumption>"
            }}
        ],
        "innovation_roadmap": [
            {{
                "innovation_theme": "<Insert innovation theme matching {company_name}>",
                "problem_statement": "<Insert specific problem statement they are solving>",
                "target_customer": "<Insert target customer>",
                "innovation_type": "<Insert type>",
                "time_horizon": "Mid-Term",
                "expected_outcome": "<Insert specific expected outcome>",
                "required_capabilities": ["<Capability 1>", "<Capability 2>"],
                "dependent_trend_names": ["<Trend name from industry_trends above>"]
            }}
        ],
        "competitive_landscape": [
            {{
                "competitor_name": "<Insert actual key competitor of {company_name} (e.g. if {company_name} is Pepsi, competitor is Coca-Cola; if Netflix, Disney+; if Nike, Adidas)>",
                "competitor_type": "Direct",
                "core_strength": "<Insert competitor's core strength>",
                "market_positioning": "<Insert position>",
                "bet_name": "<Insert competitor's strategic bet>",
                "bet_description": "<Insert description of bet>",
                "innovation_category": "<Insert category>",
                "futuristic_level": "Advanced",
                "strategic_objective": "<Insert objective>",
                "threat_level": "Medium"
            }}
        ],
        "innovx_projects": [
            {{
                "project_name": "<Insert realistic project or actual project name {company_name} works on>",
                "problem_statement": "<Insert specific problem statement for this project>",
                "target_users": "<Insert target users>",
                "innovation_objective": "<Insert innovation objective>",
                "tier_level": "Tier 1",
                "differentiation_factor": "<Insert differentiation factor>",
                "aligned_pillar_names": ["<Pillar name from strategic_pillars above>"],
                "architecture_style": "<Insert style>",
                "backend_technologies": ["<Tech 1>", "<Tech 2>"],
                "frontend_technologies": ["<Tech 1>", "<Tech 2>"],
                "ai_ml_technologies": ["<Tech 1>", "<Tech 2>"],
                "data_storage_processing": "<Insert data storage details>",
                "integrations_apis": ["<API 1>", "<API 2>"],
                "infrastructure_cloud": "<Insert cloud provider>",
                "security_compliance": "<Insert compliance details>",
                "primary_use_case": "<Insert primary use case>",
                "secondary_use_cases": ["<Use case 1>", "<Use case 2>"],
                "scenario_description": "<Insert scenario description>",
                "user_journey_summary": "<Insert user journey summary>",
                "business_value": "<Insert business value>",
                "success_metrics": ["<Metric 1>", "<Metric 2>"]
            }}
        ]
    }}
    
    IMPORTANT: You must replace all placeholders like "<Insert ...>" or "<...>" with actual, realistic, unique values matching "{company_name}"'s business, industry, and the search context. Do not output the literal placeholders. The output must be pure valid JSON and contain 100% custom content.
    """
    try:
        response_text = await global_provider_factory.generate_with_retry(
            provider_name="gemini",
            prompt=prompt,
            model="gemini-flash-latest",
            fallback_model="gemini-3.5-flash"
        )
        import re
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            response_text = match.group(0)
        cleaned_text = clean_json_string(response_text.strip())
        data = json.loads(cleaned_text, strict=False)
        return data
    except Exception as e:
        logger.error(f"Innovex generation failed for {company_name}: {e}")
        return {
            "innovx_master": {
                "company_name": company_name,
                "industry": category,
                "sub_industry": f"{category} Tech",
                "core_business_model": nature,
                "target_market": "Global Markets",
                "geographic_focus": "Worldwide"
            },
            "industry_trends": [],
            "strategic_pillars": [],
            "innovation_roadmap": [],
            "competitive_landscape": [],
            "innovx_projects": []
        }

async def run_hiring_analysis(company_name: str, category: str, difficulty: str) -> Dict[str, Any]:
    from duckduckgo_search import DDGS
    realtime_context = ""
    try:
        with DDGS() as ddgs:
            results = ddgs.text(f"{company_name} campus hiring process job roles interview rounds coding test questions", max_results=3)
            realtime_context = "\n".join([f"- {res.get('title')}: {res.get('body')}" for res in results])
    except Exception as e:
        logger.error(f"DDGS error in hiring: {e}")

    prompt = f"""
    You are an expert Technical Recruiter and Career Coach specializing in university relations.
    Analyze the hiring process and job opportunities at "{company_name}" (Category: {category}, Interview Difficulty: {difficulty}).
    
    Here is real-time search context about their hiring rounds, roles, and questions:
    {realtime_context}
    
    Generate a detailed, company-specific hiring portfolio matching this exact schema:
    {{
        "company_name": "{company_name}",
        "job_role_details": [
            {{
                "opportunity_type": "<Full Time or Internship>",
                "role_title": "<Insert realistic job title for {company_name}, e.g. Graduate Software Engineer, Associate Consultant, Data Engineer, or Network Engineer>",
                "role_category": "Technical",
                "job_description": "<Insert detailed job description specific to this role at {company_name}>",
                "compensation": "<LPA or Stipend>",
                "ctc_or_stipend": <Insert realistic CTC or monthly stipend in Rupees as an integer (e.g. 1800000 for 18 LPA, 800000 for 8 LPA, 450000 for 4.5 LPA) matching the company tier>, 
                "bonus": "<Insert details of bonus/joining incentives if applicable, or N/A>",
                "benefits_summary": "<Insert list of typical perks at {company_name}>",
                "hiring_rounds": [
                   {{
                      "round_number": 1,
                      "round_name": "<Insert actual round name, e.g. Online Coding Test, Technical Interview, or System Design Round>",
                      "round_category": "<Insert category e.g. Coding / Aptitude / System Design / Behavioral>",
                      "evaluation_type": "Technical",
                      "assessment_mode": "<Virtual / On-site>",
                      "skill_sets": [
                         {{
                            "skill_set_code": "<Insert evaluated skill, e.g. DSA, SQL, DBMS, or System Design>",
                            "typical_questions": "<Insert actual specific questions or specific topics commonly asked by {company_name} in this round, based on the search context>"
                         }}
                      ]
                   }}
                ]
            }}
        ]
    }}
    
    Notes:
    - `ctc_or_stipend` MUST be an integer representing the yearly compensation in Rupees (e.g. 1200000 for 12 LPA, 600000 for 6 LPA, etc.). Keep it realistic for the company tier.
    - Include at least 1-2 distinct job roles that "{company_name}" commonly hires for (e.g., Software Engineer, Data Analyst, Quality Engineer, Support Engineer, or equivalent roles appropriate for their category).
    - Ensure round-by-round descriptions and typical questions are highly specific to "{company_name}"'s actual interview process.
    - IMPORTANT: You must replace all placeholders like "<Insert ...>" or "<...>" with actual, realistic, unique values. Do not output the literal placeholders. The output must be pure valid JSON and contain 100% custom content.
    """
    try:
        response_text = await global_provider_factory.generate_with_retry(
            provider_name="gemini",
            prompt=prompt,
            model="gemini-flash-latest",
            fallback_model="gemini-3.5-flash"
        )
        import re
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            response_text = match.group(0)
        cleaned_text = clean_json_string(response_text.strip())
        data = json.loads(cleaned_text, strict=False)
        return data
    except Exception as e:
        logger.error(f"Hiring generation failed for {company_name}: {e}")
        return {
            "company_name": company_name,
            "job_role_details": [
                {
                    "opportunity_type": "Full Time",
                    "role_title": "Graduate Engineer Trainee",
                    "role_category": "Technical",
                    "job_description": "Work on software development lifecycle under guidance.",
                    "compensation": "LPA",
                    "ctc_or_stipend": 600000,
                    "bonus": "N/A",
                    "benefits_summary": "Health insurance and standard perks.",
                    "hiring_rounds": [
                        {
                            "round_number": 1,
                            "round_name": "Aptitude and Coding Test",
                            "round_category": "Coding",
                            "evaluation_type": "Technical",
                            "assessment_mode": "Virtual",
                            "skill_sets": [
                                {
                                    "skill_set_code": "Basic Coding",
                                    "typical_questions": "String manipulation, arrays, and basic SQL."
                                }
                            ]
                        }
                    ]
                }
            ]
        }

async def async_intelligence_node(state: AgentState) -> AgentState:
    logger.info(f"[Phase 4.5] INTELLIGENCE AGENT: Classifying company {state['company_name']}")
    
    golden_record = state.get("golden_record", {})
    company_name = state.get("company_name", "Unknown Company")
    
    intelligence_data = await run_intelligence(golden_record, company_name)
    layoffs_data = await run_layoffs_analysis(company_name)
    roadmap_data = await run_roadmap_analysis(company_name)
    
    category = golden_record.get("Category", "Technology")
    nature = golden_record.get("Nature of Company", "Product")
    difficulty = roadmap_data.get("difficulty", "Medium")
    
    innovex_data = await run_innovex_analysis(company_name, category, nature)
    hiring_data = await run_hiring_analysis(company_name, category, difficulty)
    
    return {
        "intelligence_data": intelligence_data,
        "layoffs_data": layoffs_data,
        "roadmap_data": roadmap_data,
        "innovex_data": innovex_data,
        "hiring_data": hiring_data
    }
