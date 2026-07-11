import { supabase } from "@/lib/supabase";
import { CompanyShort, CompanyFull, InnovexData, JobRoleDetails } from "@/types/company";

/**
 * STRATEGIC COMMAND SERVICE:
 * Accesses only JSON tables.
 * Strict adherence to the Runtime Contract.
 * No fallbacks, no joins, no data transformation.
 */

export const companyService = {
  /**
   * Fetches the short-form JSON for the directory view.
   * Source: companies_json.short_json
   */
  async getAllShort(): Promise<CompanyShort[]> {
    const { data, error } = await supabase
      .from("companies_json")
      .select("short_json");

    if (error) {
      console.error("Supabase Error (getAllShort):", error);
      return [];
    }

    return (data || []).map((row: any) => row.short_json as CompanyShort);
  },

  /**
   * Fetches the full-form JSON for the detail view.
   * Source: companies_json.full_json
   */
  async getFullById(id: string | number): Promise<CompanyFull | null> {
    if (!id || id === "undefined") return null;
    const { data, error } = await supabase
      .from("companies_json")
      .select("full_json")
      .eq("company_id", String(id))
      .limit(1);

    if (error) {
      console.error(`Supabase Error (getFullById ${id}):`, error);
      return null;
    }

    if (!data || data.length === 0) return null;
    
    const fullJson = data[0].full_json;
    
    // BACKWARD COMPATIBILITY & FLATTENED JSON FALLBACK
    // If the backend generated a flat 'raw_research' object instead of adhering to the strict nested schema,
    // we map it here dynamically so the UI still perfectly renders all old and newly generated companies.
    if (fullJson && fullJson.raw_research) {
      const rr = fullJson.raw_research;
      
      fullJson.overview = fullJson.overview || {};
      fullJson.overview.description = fullJson.overview.description || rr["Overview of the Company"];
      fullJson.overview.nature_of_company = fullJson.overview.nature_of_company || rr["Nature of Company"];
      fullJson.overview.headquarters = fullJson.overview.headquarters || rr["Company Headquarters"];
      fullJson.overview.vision = fullJson.overview.vision || rr["Vision"];
      fullJson.overview.mission = fullJson.overview.mission || rr["Mission"];
      fullJson.overview.values = fullJson.overview.values || rr["Values"];

      fullJson.operations = fullJson.operations || {};
      fullJson.operations.countries = fullJson.operations.countries || rr["Countries Operating In"];
      fullJson.operations.office_count = fullJson.operations.office_count || rr["Number of Offices (beyond HQ)"];
      fullJson.operations.office_locations = fullJson.operations.office_locations || rr["Office Locations"];
      fullJson.operations.employee_size = fullJson.operations.employee_size || rr["Employee Size"];
      fullJson.operations.hiring_velocity = fullJson.operations.hiring_velocity || rr["Hiring Velocity"];
      fullJson.operations.employee_turnover = fullJson.operations.employee_turnover || rr["Employee Turnover"];
      fullJson.operations.retention = fullJson.operations.retention || rr["Average Retention Tenure"];

      fullJson.business_model = fullJson.business_model || {};
      fullJson.business_model.focus_sectors = fullJson.business_model.focus_sectors || rr["Focus Sectors / Industries"];
      fullJson.business_model.offerings = fullJson.business_model.offerings || rr["Services / Offerings / Products"];
      fullJson.business_model.target_customers = fullJson.business_model.target_customers || rr["Top Customers by Client Segments"];
      fullJson.business_model.value_proposition = fullJson.business_model.value_proposition || rr["Core Value Proposition"];

      fullJson.market = fullJson.market || {};
      fullJson.market.customers = fullJson.market.customers || rr["Pain Points Being Addressed"];
      fullJson.market.top_clients = fullJson.market.top_clients || rr["Top Customers by Client Segments"];
      fullJson.market.competitors = fullJson.market.competitors || rr["Key Competitors"];
      fullJson.market.advantages = fullJson.market.advantages || rr["Competitive Advantages"];
      fullJson.market.weaknesses = fullJson.market.weaknesses || rr["Weaknesses / Gaps in Offering"];
      fullJson.market.market_share = fullJson.market.market_share || rr["Market Share (%)"];

      fullJson.financials = fullJson.financials || {};
      fullJson.financials.revenue = fullJson.financials.revenue || rr["Annual Revenues"];
      fullJson.financials.profit = fullJson.financials.profit || rr["Annual Profits"];
      fullJson.financials.valuation = fullJson.financials.valuation || rr["Company Valuation"];
      fullJson.financials.growth = fullJson.financials.growth || rr["Year-over-Year Growth Rate"];
      fullJson.financials.profitability = fullJson.financials.profitability || rr["Profitability Status"];
      fullJson.financials.burn_rate = fullJson.financials.burn_rate || rr["Burn Rate"];
      fullJson.financials.runway = fullJson.financials.runway || rr["Runway"];
      fullJson.financials.revenue_mix = fullJson.financials.revenue_mix || rr["Revenue Mix"];

      fullJson.leadership = fullJson.leadership || {};
      fullJson.leadership.ceo = fullJson.leadership.ceo || rr["CEO Name"];
      fullJson.leadership.leaders = fullJson.leadership.leaders || rr["Key Business Leaders"];
      fullJson.leadership.key_leaders = fullJson.leadership.key_leaders || rr["Key Business Leaders"];

      fullJson.technology = fullJson.technology || {};
      fullJson.technology.ai_level = fullJson.technology.ai_level || rr["AI/ML Adoption Level"];
      fullJson.technology.ai_adoption = fullJson.technology.ai_adoption || rr["AI/ML Adoption Level"];
      fullJson.technology.stack = fullJson.technology.stack || rr["Tech Stack/Tools Used"];
      fullJson.technology.tech_stack = fullJson.technology.tech_stack || rr["Tech Stack/Tools Used"];
      fullJson.technology.security = fullJson.technology.security || rr["Cybersecurity Posture"];
      fullJson.technology.cybersecurity = fullJson.technology.cybersecurity || rr["Cybersecurity Posture"];

      fullJson.strategy = fullJson.strategy || {};
      fullJson.strategy.priorities = fullJson.strategy.priorities || rr["Strategic Priorities"];
      fullJson.strategy.future = fullJson.strategy.future || rr["Future Projections"];
      fullJson.strategy.future_projection = fullJson.strategy.future_projection || rr["Future Projections"];
      fullJson.strategy.gtm = fullJson.strategy.gtm || rr["Go-to-Market Strategy"];

      fullJson.ecosystem = fullJson.ecosystem || {};
      fullJson.ecosystem.investors = fullJson.ecosystem.investors || rr["Key Investors / Backers"];
      fullJson.ecosystem.partners = fullJson.ecosystem.partners || rr["Technology Partners"];

      fullJson.culture = fullJson.culture || {};
      fullJson.culture.work_model = fullJson.culture.work_model || rr["Remote / hybrid / on-site flexibility"];
      fullJson.culture.hours = fullJson.culture.hours || rr["Typical working hours"];
      fullJson.culture.burnout_risk = fullJson.culture.burnout_risk || rr["Burnout risk"];
      fullJson.culture.manager_quality = fullJson.culture.manager_quality || rr["Manager quality"];
      fullJson.culture.psychological_safety = fullJson.culture.psychological_safety || rr["Psychological safety"];
      fullJson.culture.diversity_inclusion = fullJson.culture.diversity_inclusion || rr["Diversity & inclusion"];
      fullJson.culture.ethical_standards = fullJson.culture.ethical_standards || rr["Ethical standards"];

      fullJson.work_environment = fullJson.work_environment || {};
      fullJson.work_environment.flexibility = fullJson.work_environment.flexibility || rr["Remote / hybrid / on-site flexibility"];
      fullJson.work_environment.leave = fullJson.work_environment.leave || rr["Leave policy"];
      fullJson.work_environment.overtime = fullJson.work_environment.overtime || rr["Overtime expectations"];

      fullJson.infrastructure = fullJson.infrastructure || {};
      fullJson.infrastructure.location = fullJson.infrastructure.location || rr["Office zone type"];
      fullJson.infrastructure.transport = fullJson.infrastructure.transport || rr["Public transport access"];

      fullJson.employee_experience = fullJson.employee_experience || {};
      fullJson.employee_experience.onboarding = fullJson.employee_experience.onboarding || rr["Onboarding and training quality"];
      fullJson.employee_experience.mentorship = fullJson.employee_experience.mentorship || rr["Mentorship availability"];
      fullJson.employee_experience.training = fullJson.employee_experience.training || rr["Training/Development Spend"];
      fullJson.employee_experience.ownership = fullJson.employee_experience.ownership || rr["Early ownership"];
      fullJson.employee_experience.impact = fullJson.employee_experience.impact || rr["Work impact"];

      fullJson.risks = fullJson.risks || {};
      fullJson.risks.layoffs = fullJson.risks.layoffs || rr["Layoff history"];
      fullJson.risks.macro = fullJson.risks.macro || rr["Macro Risks"];

      fullJson.benefits = fullJson.benefits || {};
      fullJson.benefits.salary = fullJson.benefits.salary || rr["Fixed vs variable pay"];
      fullJson.benefits.bonus = fullJson.benefits.bonus || rr["Bonus predictability"];
      fullJson.benefits.insurance = fullJson.benefits.insurance || rr["Family health insurance"];
      fullJson.benefits.wellness = fullJson.benefits.wellness || rr["Lifestyle and wellness benefits"];

      fullJson.growth = fullJson.growth || {};
      fullJson.growth.career = fullJson.growth.career || rr["Promotion clarity"];
      fullJson.growth.learning = fullJson.growth.learning || rr["Learning culture"];

      fullJson.advanced = fullJson.advanced || {};
      fullJson.advanced.ip = fullJson.advanced.ip || rr["Intellectual Property"];
      fullJson.advanced.rnd = fullJson.advanced.rnd || rr["R&D Investment"];
      fullJson.advanced.regulatory = fullJson.advanced.regulatory || rr["Regulatory & Compliance Status"];
      fullJson.advanced.geopolitical = fullJson.advanced.geopolitical || rr["Geopolitical Risks"];
      fullJson.advanced.macro_risk = fullJson.advanced.macro_risk || rr["Macro Risks"];

      fullJson.final_assessment = fullJson.final_assessment || {};
      fullJson.final_assessment.mission_clarity = fullJson.final_assessment.mission_clarity || rr["Mission clarity"];
      fullJson.final_assessment.sustainability = fullJson.final_assessment.sustainability || rr["Sustainability and CSR"];
      fullJson.final_assessment.crisis_behavior = fullJson.final_assessment.crisis_behavior || rr["Crisis behavior"];
      fullJson.final_assessment.risk_level = fullJson.final_assessment.risk_level || rr["Macro Risks"];

      fullJson.digital_presence = fullJson.digital_presence || {};
      fullJson.digital_presence.website = fullJson.digital_presence.website || rr["Website URL"];
      fullJson.digital_presence.linkedin = fullJson.digital_presence.linkedin || rr["LinkedIn Profile URL"];
      fullJson.digital_presence.twitter = fullJson.digital_presence.twitter || rr["Twitter (X) Handle"];
      fullJson.digital_presence.facebook = fullJson.digital_presence.facebook || rr["Facebook Page URL"];
      fullJson.digital_presence.instagram = fullJson.digital_presence.instagram || rr["Instagram Page URL"];
    }
    
    return fullJson as CompanyFull;
  },

  /**
   * Fetches the short-form JSON for the detail view (for logo).
   * Source: companies_json.short_json
   */
  async getShortById(id: string | number): Promise<CompanyShort | null> {
    if (!id || id === "undefined") return null;
    const { data, error } = await supabase
      .from("companies_json")
      .select("short_json")
      .eq("company_id", String(id))
      .limit(1);

    if (error) {
      console.error(`Supabase Error (getShortById ${id}):`, error);
      return null;
    }

    return (data && data.length > 0 ? data[0].short_json : null) as CompanyShort | null;
  },

  /**
   * Fetches Innovex data for analytics.
   * Source: innovx_json.json_data
   */
  async getInnovexData(id: string | number): Promise<InnovexData | null> {
    if (!id || id === "undefined") return null;
    const { data, error } = await supabase
      .from("innovx_json")
      .select("json_data")
      .eq("company_id", String(id))
      .limit(1);

    if (error) {
      console.error(`Supabase Error (getInnovexData ${id}):`, error);
      return null;
    }

    return (data && data.length > 0 ? data[0].json_data : null) as InnovexData | null;
  },

  /**
   * Fetches Hiring/Role details.
   * Source: job_role_details_json.job_role_json
   * Uses array query (not .single()) to avoid PGRST116 errors when 0 or >1 rows exist.
   */
  async getHiringData(id: string | number): Promise<JobRoleDetails | null> {
    if (!id || id === "undefined") return null;
    const { data, error } = await supabase
      .from("job_role_details_json")
      .select("job_role_json")
      .eq("company_id", String(id))
      .limit(1);

    if (error) {
      console.error(`Supabase Error (getHiringData ${id}):`, error);
      return null;
    }

    return (data && data.length > 0 ? data[0].job_role_json : null) as JobRoleDetails | null;
  },

  /**
   * Search functionality filtering against the short_json keys.
   */
  async search(query: string): Promise<CompanyShort[]> {
    const companies = await this.getAllShort();
    const q = query.toLowerCase();
    return companies.filter(c => 
      c.name?.toLowerCase().includes(q) || 
      c.short_name?.toLowerCase().includes(q) || 
      c.category?.toLowerCase().includes(q)
    );
  },

  async getMultipleShortByIds(ids: (string | number)[]): Promise<CompanyShort[]> {
    const all = await this.getAllShort();
    return all.filter(c => ids.includes(String(c.company_id)));
  },

  async getStats() {
    const companies = await this.getAllShort();
    return {
      total: companies.length,
      categories: new Set(companies.map((c) => c.category)).size,
      topCategory: companies.reduce((acc, curr) => {
        const count = companies.filter(c => c.category === curr.category).length;
        return count > acc.count ? { name: curr.category, count } : acc;
      }, { name: "N/A", count: 0 }).name
    };
  },

  /**
   * Deletes a company record from the database.
   */
  async deleteCompany(id: string | number): Promise<boolean> {
    if (!id || id === "undefined") return false;
    
    const { error } = await supabase
      .from("companies_json")
      .delete()
      .eq("company_id", String(id));

    if (error) {
      console.error(`Supabase Error (deleteCompany ${id}):`, error);
      return false;
    }
    return true;
  }
};
