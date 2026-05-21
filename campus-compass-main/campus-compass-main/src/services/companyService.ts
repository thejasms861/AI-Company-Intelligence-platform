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

    return (data && data.length > 0 ? data[0].full_json : null) as CompanyFull | null;
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
  }
};
