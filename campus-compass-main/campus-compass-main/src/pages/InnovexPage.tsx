import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCompanies, useInnovex } from "@/hooks/useCompanies";
import AppLayout from "@/components/layout/AppLayout";
import { 
  Building2, 
  Search, 
  TrendingUp, 
  Target, 
  ShieldAlert, 
  Cpu, 
  Globe, 
  Zap, 
  Briefcase,
  Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InnovexPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
  const [selectedId, setSelectedId] = useState<string | number>(initialId);
  const { data: innovex, isLoading: loadingInnovex } = useInnovex(selectedId);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setSelectedId(id);
    }
  }, [searchParams]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header & Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Cpu className="text-primary" size={28} />
              </div>
              Innovex Intelligence
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Deep-tech innovation mapping, industry trends, and strategic R&D roadmaps derived from authoritative JSON infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={String(selectedId)}
              onValueChange={(val) => setSelectedId(val)}
            >
              <SelectTrigger className="w-[280px] bg-slate-900/50 border-border/50 text-indigo-400 font-medium">
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-muted-foreground" />
                  <SelectValue placeholder="Select Company to Analyze..." />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-border text-slate-200">
                {companies.map(c => (
                  <SelectItem key={c.company_id} value={String(c.company_id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!selectedId ? (
          <div className="surface-card py-32 text-center animate-in fade-in slide-in-from-bottom-4">
            <Globe size={64} className="mx-auto text-primary/10 mb-6" />
            <h2 className="text-xl font-semibold text-slate-300">Awaiting Selection</h2>
            <p className="text-muted-foreground text-sm mt-2">Select a company from the dropdown to initialize the Innovex engine.</p>
          </div>
        ) : loadingInnovex ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="h-64 bg-slate-800/50 rounded-2xl"></div>
              <div className="h-64 bg-slate-800/50 rounded-2xl col-span-2"></div>
            </div>
          </div>
        ) : innovex ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Master Info */}
            <div className="surface-card p-6 bg-gradient-to-br from-slate-900 to-slate-900/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Building2 size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-tighter font-bold">
                    {innovex.innovx_master.industry}
                  </Badge>
                  <Badge variant="outline" className="text-indigo-400 border-indigo-500/20 bg-indigo-500/5 uppercase tracking-tighter font-bold">
                    {innovex.innovx_master.sub_industry}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{innovex.innovx_master.company_name}</h2>
                <p className="text-slate-300 max-w-3xl leading-relaxed">{innovex.innovx_master.core_business_model}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Target Market</div>
                    <div className="text-sm font-semibold text-white mt-1">{innovex.innovx_master.target_market}</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Focus</div>
                    <div className="text-sm font-semibold text-white mt-1">{innovex.innovx_master.geographic_focus}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Trends & Pillars */}
              <div className="space-y-8">
                {/* Strategic Pillars */}
                <section>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Zap size={14} /> Strategic Pillars
                  </h3>
                  <div className="space-y-3">
                    {(innovex.strategic_pillars || []).map((pillar, idx) => (
                      <div key={idx} className="surface-card p-4 hover:border-primary/30 transition-colors">
                        <h4 className="text-sm font-bold text-white mb-1">{pillar.pillar_name}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{pillar.pillar_description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {(pillar.key_technologies || []).map(tech => (
                            <span key={tech} className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Industry Trends */}
                <section>
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <TrendingUp size={14} /> Industry Trends
                  </h3>
                  <div className="space-y-4">
                    {(innovex.industry_trends || []).map((trend, idx) => (
                      <div key={idx} className="p-4 border-l-2 border-slate-800 hover:border-indigo-500/50 transition-colors bg-slate-900/30 rounded-r-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-bold text-white">{trend.trend_name}</h4>
                          <span className="text-[10px] font-bold text-indigo-400">{trend.time_horizon_years}y Horizon</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{trend.trend_description}</p>
                        <div className="flex flex-wrap gap-1">
                          {(trend.impact_areas || []).map(area => (
                            <Badge key={area} className="text-[8px] bg-slate-800 hover:bg-slate-800 text-slate-300 border-none px-2 h-4">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column: Roadmap, Competitive, Projects */}
              <div className="lg:col-span-2 space-y-8">
                {/* Innovation Roadmap */}
                <section>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Target size={14} /> Innovation Roadmap
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(innovex.innovation_roadmap || []).map((item, idx) => (
                      <div key={idx} className="surface-card p-5 bg-gradient-to-tr from-slate-900 to-slate-800/50">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-base font-bold text-white">{item.innovation_theme}</h4>
                          <Badge variant="secondary" className="text-[9px] h-5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            {item.time_horizon}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Problem Statement</div>
                            <p className="text-xs text-slate-300 italic">"{item.problem_statement}"</p>
                          </div>
                          <div>
                            <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Expected Outcome</div>
                            <p className="text-xs text-emerald-400/90 font-medium">{item.expected_outcome}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Competitive Landscape */}
                <section>
                  <h3 className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ShieldAlert size={14} /> Competitive Landscape
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-border/50">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900">
                          <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase">Competitor</th>
                          <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase">Market Position</th>
                          <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase">Threat</th>
                          <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase">Strategic Bet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {(innovex.competitive_landscape || []).map((comp, idx) => (
                          <tr key={idx} className="bg-slate-900/30 hover:bg-slate-800/50 transition-colors">
                            <td className="p-4">
                              <div className="text-sm font-bold text-white">{comp.competitor_name}</div>
                              <div className="text-[10px] text-muted-foreground">{comp.competitor_type}</div>
                            </td>
                            <td className="p-4">
                              <span className="text-xs text-slate-300">{comp.market_positioning}</span>
                            </td>
                            <td className="p-4">
                              <Badge className={`text-[9px] ${comp.threat_level === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                {comp.threat_level}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="text-[11px] font-medium text-white">{comp.bet_name}</div>
                              <div className="text-[10px] text-muted-foreground leading-tight mt-1">{comp.bet_description}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Key Projects */}
                <section>
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Layers size={14} /> Active Innovex Projects
                  </h3>
                  <div className="space-y-6">
                    {(innovex?.innovx_projects || []).map((project, idx) => (
                      <div key={idx} className="surface-card p-6 border-l-4 border-purple-500/50">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                          <div>
                            <h4 className="text-xl font-bold text-white mb-1">{project.project_name}</h4>
                            <p className="text-sm text-muted-foreground">{project.innovation_objective}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">{project.tier_level}</Badge>
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{project.architecture_style}</Badge>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="p-4 bg-slate-800/30 rounded-xl">
                              <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <Briefcase size={12} /> Tech Stack Architecture
                              </h5>
                              <div className="space-y-3">
                                <div>
                                  <div className="text-[9px] text-muted-foreground uppercase mb-1">Backend</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(project.backend_technologies || []).map(t => <span key={t} className="text-[10px] font-mono text-slate-300">{t}</span>)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[9px] text-muted-foreground uppercase mb-1">Frontend</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(project.frontend_technologies || []).map(t => <span key={t} className="text-[10px] font-mono text-slate-300">{t}</span>)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[9px] text-muted-foreground uppercase mb-1">AI/ML Engine</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(project.ai_ml_technologies || []).map(t => <span key={t} className="text-[10px] font-mono text-primary">{t}</span>)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">User Journey</h5>
                              <div className="p-3 bg-slate-800/30 rounded-lg text-xs text-slate-300 italic border-l-2 border-slate-700">
                                "{project.user_journey_summary}"
                              </div>
                            </div>
                            <div>
                              <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Primary Use Case</h5>
                              <p className="text-xs text-white font-medium">{project.primary_use_case}</p>
                            </div>
                            <div>
                              <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Success Metrics</h5>
                              <div className="flex flex-wrap gap-2">
                                {(project.success_metrics || []).map(m => (
                                  <Badge key={m} variant="outline" className="text-[9px] border-slate-700 text-slate-400">{m}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="surface-card py-24 text-center">
             <ShieldAlert size={48} className="mx-auto text-orange-500/20 mb-4" />
             <p className="text-muted-foreground">No Innovex data found for this company in Supabase.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
