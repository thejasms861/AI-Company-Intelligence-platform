/**
 * AUTHORITATIVE SCHEMA DEFINITIONS
 * Derived from /schema/*.json authority files.
 * Every field here maps 1:1 to Supabase JSONB keys.
 */

// --- Company Short (Table: companies_json, Column: short_json) ---
export interface CompanyShort {
  company_id: number;
  name: string;
  short_name: string;
  logo_url: string;
  category: string;
  operating_countries: string;
  office_locations: string;
  employee_size: string;
  yoy_growth_rate: string;
  company_tier?: string;
}

// --- Company Full (Table: companies_json, Column: full_json) ---
export interface SkillRoadmapData {
  skills: {
    dsa: number;
    aptitude: number;
    problem_solving: number;
    communication: number;
    projects: number;
    core_subjects: number;
    coding: number;
    system_design: number;
  };
  overall_effort: number;
  difficulty: string;
  company_type: string;
  focus_areas: string[];
  estimated_prep_time: string;
}

export interface CompanyFull {
  company_id: number;
  name: string;
  short_name: string;
  category: string;
  incorporation_year: number;
  overview: {
    description: string;
    nature_of_company: string;
    headquarters: string;
    vision?: string;
    mission?: string;
    values?: string[];
  };
  operations: {
    countries: string[];
    office_count: string;
    office_locations?: string[];
    employee_size: string;
    hiring_velocity?: string;
    employee_turnover?: string;
    retention?: string;
  };
  business_model: {
    focus_sectors: string[];
    offerings: string[];
    target_customers?: string[];
    value_proposition: string;
  };
  market: {
    customers: string;
    top_clients: string[];
    competitors?: string[];
    advantages?: string[];
    weaknesses?: string[];
    market_share: string;
  };
  financials: {
    revenue: string;
    profit?: string;
    valuation: string;
    growth?: string;
    profitability: string;
    burn_rate?: string;
    runway?: string;
    revenue_mix?: string[];
  };
  product_metrics?: {
    nps: string;
    churn: string;
    sales_motion: string;
  };
  leadership: {
    ceo: string;
    leaders?: string[];
    key_leaders?: string[];
  };
  technology: {
    ai_level?: string;
    ai_adoption?: string;
    stack: string[];
    tech_stack?: string[];
    security?: string;
    cybersecurity?: string;
  };
  strategy: {
    priorities: string[];
    future?: string;
    future_projection?: string;
    gtm?: string;
  };
  ecosystem?: {
    investors: string[];
    partners: string[];
  };
  culture: {
    work_model: string;
    hours: string;
    burnout_risk: string;
    manager_quality: string;
    psychological_safety: string;
    diversity_inclusion: string;
    ethical_standards: string;
  };
  work_environment?: {
    flexibility: string;
    leave: string;
    overtime: string;
  };
  infrastructure?: {
    location: string;
    transport: string;
  };
  employee_experience?: {
    onboarding: string;
    mentorship: string;
    training: string;
    ownership: string;
    impact: string;
  };
  company_strength?: {
    brand: string;
    clients: string;
    network: string;
    global_exposure: string;
    skills: string;
  };
  risks?: {
    layoffs: string;
    macro: string;
  };
  benefits?: {
    salary: string;
    bonus: string;
    insurance: string;
    wellness: string;
  };
  growth?: {
    career: string;
    learning: string;
  };
  advanced?: {
    ip: string;
    rnd: string;
    regulatory: string;
    geopolitical: string;
    macro_risk: string;
  };
  final_assessment: {
    mission_clarity: string;
    sustainability: string;
    crisis_behavior: string;
    risk_level: string;
  };
  intelligence_data?: {
    company_tier: string;
    reasoning: string;
    campus_hiring_volumes?: {
      tier_1: string;
      tier_2: string;
      tier_3: string;
    };
    badges: string[];
  };
  layoffs_data?: {
    has_layoffs: boolean;
    layoff_events: Array<{
      year: number;
      number_laid_off: number;
      roles_affected: string;
    }>;
  };
  digital_presence?: {
    website: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    careers_page?: string;
  };
  roadmap_data?: SkillRoadmapData;
}

// --- Innovex Data (Table: innovx_json, Column: json_data) ---
export interface InnovexData {
  innovx_master: {
    company_name: string;
    industry: string;
    sub_industry: string;
    core_business_model: string;
    target_market: string;
    geographic_focus: string;
  };
  industry_trends: Array<{
    trend_name: string;
    trend_description: string;
    time_horizon_years: number;
    trend_drivers: string[];
    impact_areas: string[];
    strategic_importance: string;
  }>;
  innovation_roadmap: Array<{
    innovation_theme: string;
    problem_statement: string;
    target_customer: string;
    innovation_type: string;
    time_horizon: string;
    expected_outcome: string;
    required_capabilities: string[];
    dependent_trend_names: string[];
  }>;
  competitive_landscape: Array<{
    competitor_name: string;
    competitor_type: string;
    core_strength: string;
    market_positioning: string;
    bet_name: string;
    bet_description: string;
    innovation_category: string;
    futuristic_level: string;
    strategic_objective: string;
    threat_level: string;
  }>;
  strategic_pillars: Array<{
    cto_vision_statement: string;
    pillar_name: string;
    pillar_description: string;
    focus_area: string;
    key_technologies: string[];
    strategic_risks: string;
    strategic_assumptions: string;
  }>;
  innovx_projects: Array<{
    project_name: string;
    problem_statement: string;
    target_users: string;
    innovation_objective: string;
    tier_level: string;
    differentiation_factor: string;
    aligned_pillar_names: string[];
    architecture_style: string;
    backend_technologies: string[];
    frontend_technologies: string[];
    ai_ml_technologies: string[];
    data_storage_processing: string;
    integrations_apis: string[];
    infrastructure_cloud: string;
    security_compliance: string;
    primary_use_case: string;
    secondary_use_cases: string[];
    scenario_description: string;
    user_journey_summary: string;
    business_value: string;
    success_metrics: string[];
  }>;
}

// --- Job Role Details (Table: job_role_details_json, Column: job_role_json) ---
export interface JobRoleDetails {
  company_name: string;
  job_role_details: Array<{
    opportunity_type: string;
    role_title: string;
    role_category: string;
    job_description: string;
    compensation: string;
    ctc_or_stipend: number;
    bonus?: string;
    benefits_summary?: string;
    hiring_rounds: Array<{
      round_number: number;
      round_name: string;
      round_category: string;
      evaluation_type: string;
      assessment_mode: string;
      skill_sets: Array<{
        skill_set_code: string;
        typical_questions: string;
      }>;
    }>;
  }>;
}
