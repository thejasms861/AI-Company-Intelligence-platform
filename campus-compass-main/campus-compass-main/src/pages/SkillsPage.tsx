import { useState, useMemo } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import AppLayout from "@/components/layout/AppLayout";
import { Target, Search, CheckCircle2, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * SKILLS MAPPING ENGINE:
 * Bound strictly to CompanyShort (short_json column).
 * Matches against Category and Office Locations.
 */
export default function SkillsPage() {
  const { data: companies = [], isLoading } = useCompanies();
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    if (!query.trim() || companies.length === 0) return [];

    const terms = query.toLowerCase().split(",").map(t => t.trim()).filter(Boolean);

    return companies
      .map((company) => {
        let score = 0;
        const matchingTerms: string[] = [];

        terms.forEach((term) => {
          // Rule: 1:1 Mapping to JSON keys only
          if (company.category?.toLowerCase().includes(term)) {
            score += 40;
            matchingTerms.push(term);
          }
          if (company.name?.toLowerCase().includes(term)) {
            score += 30;
            matchingTerms.push(term);
          }
          if (company.office_locations?.toLowerCase().includes(term)) {
            score += 20;
            matchingTerms.push(term);
          }
        });

        return { ...company, score, matchingTerms };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [query, companies]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3 text-slate-100">
            <Target className="text-primary" />
            Intelligence Mapping
          </h1>
          <p className="text-sm text-muted-foreground">
            Search sectors, categories, or locations mapping directly to Supabase JSON keys.
          </p>
        </div>

        <div className="surface-card p-2 mb-8 bg-slate-900/50 border-primary/20">
          <div className="relative">
            <textarea
              placeholder="Search by category or location (e.g. SDE, Healthcare, Bangalore, USA)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-24 p-4 rounded-lg bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/30"
            />
          </div>
        </div>

        {query && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary" />
              Direct Schema Matches ({matches.length})
            </h2>

            {matches.length === 0 ? (
              <div className="text-center py-12 surface-card border-dashed">
                <Search size={32} className="mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-sm text-muted-foreground">No matches found in authoritative short_json.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {matches.map((company) => (
                  <Link
                    key={company.company_id}
                    to={`/company/${company.company_id}`}
                    className="surface-card p-4 hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center justify-between group border-l-2 border-l-transparent hover:border-l-primary"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                         <Building2 size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{company.name}</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{company.category} • {company.office_locations}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-mono font-bold text-primary">{company.score} pts</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
