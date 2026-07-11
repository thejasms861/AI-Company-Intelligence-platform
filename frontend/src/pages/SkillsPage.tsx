import { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Target, Search, CheckCircle2, Building2, Sliders, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CompanyFull } from "@/types/company";

export default function SkillsPage() {
  const [companies, setCompanies] = useState<CompanyFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userSkills, setUserSkills] = useState({
    dsa: 5,
    problem_solving: 5,
    coding: 5,
    system_design: 5,
    aptitude: 5,
    communication: 5,
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase.from('companies_json').select('company_id, full_json');
        if (error) throw error;
        const parsed = data.map(row => row.full_json as CompanyFull).filter(c => c && c.roadmap_data && c.roadmap_data.skills);
        setCompanies(parsed);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleSkillChange = (skill: string, value: number) => {
    setUserSkills(prev => ({ ...prev, [skill]: value }));
  };

  const matches = useMemo(() => {
    if (companies.length === 0) return [];

    return companies.map((company) => {
      const reqs = company.roadmap_data!.skills;
      let score = 0;
      let totalDiff = 0;

      // Calculate compatibility based on how close user skill is to required skill
      // If user skill >= required, it's a huge plus.
      Object.entries(userSkills).forEach(([skill, userLevel]) => {
        const reqLevel = reqs[skill as keyof typeof reqs] || 0;
        const diff = userLevel - reqLevel;
        
        if (diff >= 0) {
          score += 20 + diff * 2; // Extra points for exceeding
        } else {
          score += 10 + diff * 4; // Harsh penalty for falling short
        }
        totalDiff += diff;
      });

      // Normalize score out of 100 max
      const normalizedMatch = Math.max(0, Math.min(100, Math.round((score / 120) * 100)));

      return { 
        ...company, 
        matchScore: normalizedMatch,
        isQualified: totalDiff >= -5 // Custom heuristic for qualification
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
  }, [userSkills, companies]);

  const getCompanyType = (name: string, type: string) => {
    const serviceKeywords = [
      "infosys", "capgemini", "tcs", "tata consultancy", "wipro", 
      "publicis", "pwc", "pricewaterhouse", "cognizant", "prodapt", 
      "quest global", "accenture", "lti", "mindtree", "ltimindtree", 
      "hcl", "tech mahindra", "dxc", "ey", "deloitte", "kpmg", "zenken"
    ];
    const nameLower = name.toLowerCase();
    if (serviceKeywords.some(kw => nameLower.includes(kw))) {
      return "Service-based";
    }
    return type || "Product-based";
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar - Skill Sliders */}
        <div className="w-full md:w-1/3 space-y-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
              <Sliders className="text-primary" />
              Skill Matchmaker
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Adjust your current skill levels out of 10 to find companies where you are the perfect fit.
            </p>
          </div>

          <div className="surface-card p-6 space-y-6">
            {Object.entries(userSkills).map(([skill, val]) => (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="capitalize text-slate-200">{skill.replace('_', ' ')}</span>
                  <span className="text-primary">{val}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={val}
                  onChange={(e) => handleSkillChange(skill, parseInt(e.target.value))}
                  className="w-full accent-primary bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Matched Companies */}
        <div className="w-full md:w-2/3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Target size={16} className="text-primary" />
            Top Compatible Companies ({matches.length})
          </h2>

          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground animate-pulse">
              Analyzing skill roadmaps...
            </div>
          ) : (
            <div className="grid gap-4 animate-fade-in">
              {matches.map((company) => (
                <div key={company.company_id} className="surface-card p-5 hover:border-primary/50 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4" style={{ borderLeftColor: company.matchScore > 75 ? '#10b981' : company.matchScore > 50 ? '#f59e0b' : '#ef4444' }}>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-12 h-12 rounded bg-slate-800/50 flex items-center justify-center border border-slate-700/50 shrink-0">
                      <Building2 size={24} className="text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{company.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {company.roadmap_data?.difficulty}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {getCompanyType(company.name, company.roadmap_data?.company_type || "")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-100">{company.matchScore}%</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Match Score</div>
                    </div>
                    
                    <Link to={`/company/${company.company_id}`} className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors">
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              ))}
              
              {matches.length === 0 && (
                <div className="text-center py-12 surface-card border-dashed">
                  <p className="text-sm text-muted-foreground">No valid skill roadmaps found in the database.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
      </div>
    </AppLayout>
  );
}
