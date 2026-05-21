import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCompanies, useHiring } from "@/hooks/useCompanies";
import AppLayout from "@/components/layout/AppLayout";
import { 
  Building2, 
  Search, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Code, 
  BrainCircuit,
  Wallet,
  Gift,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function JobHoldingsPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
  const [selectedId, setSelectedId] = useState<string | number>(initialId);
  const { data: hiring, isLoading: loadingHiring } = useHiring(selectedId);

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
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Briefcase className="text-emerald-400" size={28} />
              </div>
              Job Holdings & Rounds
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Comprehensive role mapping, compensation structures, and step-by-step interview round intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={String(selectedId)}
              onValueChange={(val) => setSelectedId(val)}
            >
              <SelectTrigger className="w-[280px] bg-slate-900/50 border-border/50 text-emerald-400 font-medium">
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-muted-foreground" />
                  <SelectValue placeholder="Select Company to View Roles..." />
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
            <Briefcase size={64} className="mx-auto text-emerald-500/10 mb-6" />
            <h2 className="text-xl font-semibold text-slate-300">Target Selection Pending</h2>
            <p className="text-muted-foreground text-sm mt-2">Initialize the hiring intelligence engine by selecting a target company.</p>
          </div>
        ) : loadingHiring ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-48 bg-slate-800/50 rounded-2xl"></div>
            <div className="h-48 bg-slate-800/50 rounded-2xl"></div>
          </div>
        ) : hiring ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Summary Banner */}
            <div className="flex items-center gap-4 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="text-emerald-400" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{hiring?.company_name} Portfolio</h2>
                <p className="text-sm text-emerald-400/70 font-medium">
                  Currently mapping {hiring?.job_role_details?.length || 0} structured job roles
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {(hiring?.job_role_details || []).map((role, idx) => (
                <div key={idx} className="surface-card overflow-hidden group">
                  {/* Role Header */}
                  <div className="p-6 border-b border-border/30 bg-slate-900/40">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="h-14 w-14 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BrainCircuit className="text-primary" size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-[9px] uppercase tracking-wider bg-slate-800 text-slate-400">
                              {role.opportunity_type}
                            </Badge>
                            <Badge className="text-[9px] uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                              {role.role_category}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold text-white">{role.role_title}</h3>
                          <div className="flex items-center gap-4 mt-2">
                             <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                               <Wallet size={14} /> 
                               ₹{(role.ctc_or_stipend / 100000).toFixed(1)}L {role.compensation}
                             </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-end items-end gap-2 text-right">
                         {role.bonus && (
                           <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                             <Gift size={12} /> {role.bonus}
                           </div>
                         )}
                         <div className="text-[10px] text-muted-foreground max-w-[200px] leading-tight">
                           {role.benefits_summary}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 grid lg:grid-cols-3 gap-8">
                    {/* Role Description */}
                    <div className="lg:col-span-1">
                       <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Context & Requirements</h4>
                       <p className="text-sm text-slate-300 leading-relaxed">
                         {role.job_description}
                       </p>
                    </div>

                    {/* Hiring Rounds Timeline */}
                    <div className="lg:col-span-2">
                       <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Round-by-Round Intelligence</h4>
                       <div className="relative space-y-4">
                          <div className="absolute left-6 top-2 bottom-2 w-px bg-slate-800"></div>
                          
                          {(role.hiring_rounds || []).map((round, rIdx) => (
                            <div key={rIdx} className="relative pl-14">
                               <div className="absolute left-4 top-1.5 h-4 w-4 rounded-full bg-slate-900 border-2 border-primary z-10"></div>
                               <div className="surface-card p-4 hover:border-primary/20 transition-all">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                                     <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-bold text-primary">
                                          {round.round_number}
                                        </div>
                                        <div>
                                           <h5 className="text-sm font-bold text-white">{round.round_name}</h5>
                                           <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                              <Badge variant="outline" className="h-4 text-[8px] py-0 border-slate-700">{round.round_category}</Badge>
                                              <span>•</span>
                                              <span className="flex items-center gap-1"><Clock size={10} /> {round.assessment_mode}</span>
                                           </div>
                                        </div>
                                     </div>
                                     <Badge className={round.evaluation_type === 'Technical' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}>
                                       {round.evaluation_type}
                                     </Badge>
                                  </div>

                                  <div className="grid md:grid-cols-2 gap-4">
                                     {(round.skill_sets || []).map((skill, sIdx) => (
                                       <div key={sIdx} className="p-3 bg-slate-800/30 rounded-lg border border-border/20">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{skill.skill_set_code}</span>
                                            <Code size={12} className="text-muted-foreground" />
                                          </div>
                                          <div className="text-[11px] text-slate-300 leading-relaxed italic">
                                            "{skill.typical_questions}"
                                          </div>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="surface-card py-24 text-center">
             <ShieldAlert size={48} className="mx-auto text-orange-500/20 mb-4" />
             <p className="text-muted-foreground">No Job Role data found for this company in Supabase.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
