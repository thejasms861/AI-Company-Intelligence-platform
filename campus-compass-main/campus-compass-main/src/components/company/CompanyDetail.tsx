import { useState } from "react";
import { Link } from "react-router-dom";
import { CompanyFull, CompanyShort, InnovexData, JobRoleDetails } from "@/types/company";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, AlertTriangle, Briefcase, GraduationCap, DollarSign, Gift, Star, ChevronRight, ClipboardList, MonitorSmartphone, Brain, Lightbulb, Target, Layers, Cpu, Database, Zap, ArrowRight, MapPin } from "lucide-react";

const SKILL_SET_LABELS: Record<string, { label: string; color: string }> = {
  COD:   { label: "Coding",            color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  DSA:   { label: "Data Structures",   color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  APTI:  { label: "Aptitude",          color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  OOD:   { label: "Object Design",     color: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
  OS:    { label: "Operating Systems", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  SYSD:  { label: "System Design",     color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  CLOUD: { label: "Cloud",             color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
  SWE:   { label: "Software Engg",     color: "bg-green-500/10 text-green-500 border-green-500/20" },
  SQL:   { label: "SQL / Database",    color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  AI:    { label: "AI / ML",           color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  COMM:  { label: "Communication",     color: "bg-lime-500/10 text-lime-500 border-lime-500/20" },
};

function TableDataRow({ label, value }: { label: string; value: any }) {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  const displayValue = (val: any) => {
    if (Array.isArray(val)) {
      return val.join("; ");
    }
    return String(val);
  };

  return (
    <div className="flex flex-col md:flex-row py-4 border-b border-border/50 last:border-0 gap-2 md:gap-8 hover:bg-muted/10 transition-colors px-2 rounded-md">
      <div className="md:w-1/3 text-sm font-semibold text-muted-foreground shrink-0 pt-0.5">
        {label}
      </div>
      <div className="md:w-2/3 text-sm text-foreground leading-relaxed">
        {displayValue(value)}
      </div>
    </div>
  );
}

function TabCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-6 bg-card border border-border shadow-sm rounded-xl mt-4 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-6">{title}</h2>
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  );
}

export default function CompanyDetail({ 
  company, 
  shortCompany,
  innovex, 
  hiring,
  defaultTab = "overview"
}: { 
  company?: CompanyFull, 
  shortCompany?: CompanyShort,
  innovex?: InnovexData, 
  hiring?: JobRoleDetails,
  defaultTab?: string
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const companyId = company?.company_id || shortCompany?.company_id;
  
  const displayName = company?.name || innovex?.innovx_master?.company_name || hiring?.company_name || "Unknown Entity";
  const displayCategory = company?.category || innovex?.innovx_master?.industry || "Category Unavailable";
  
  const originalLogoUrl = shortCompany?.logo_url || company?.logo_url;
  let logoUrl = originalLogoUrl;
  
  // If it's a Clearbit URL (often blocked), use Google Favicon as a proxy
  if (logoUrl && logoUrl.includes('clearbit.com')) {
    try {
      const url = new URL(logoUrl);
      const domain = url.pathname.split('/').pop() || url.hostname;
      logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
      // fallback handled by onError
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start gap-4 mb-6 bg-card p-6 rounded-xl border border-border shadow-sm">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt={displayName}
            className="w-16 h-16 rounded-lg object-contain bg-white p-2 border border-border shrink-0 shadow-sm"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const fallbackDomain = originalLogoUrl?.includes('//') ? new URL(originalLogoUrl).hostname : originalLogoUrl;
              
              if (target.src.includes('google.com/s2/favicons')) {
                // If Google Favicon also failed, use UI Avatar
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
              } else {
                // Try Google Favicon as secondary fallback
                target.src = `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=128`;
              }
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0 shadow-sm">
             <Building2 size={32} className="text-primary/70" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{displayName}</h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
            <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {displayCategory}
            </span>
            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
              <MapPin size={14} className="text-slate-500" />
              {company?.overview?.headquarters || shortCompany?.office_locations?.split(';')[0] || "Location Not Disclosed"}
            </div>
            {innovex?.innovx_master?.target_market && (
              <span className="chip bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] uppercase font-bold">
                {innovex.innovx_master.target_market}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-300 mt-4 leading-relaxed max-w-4xl line-clamp-2">
            {company?.overview?.description || innovex?.innovx_master?.core_business_model || "Comprehensive intelligence profile for " + displayName}
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link 
              to={`/job-holdings?id=${encodeURIComponent(companyId || "")}`}
              className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg text-xs font-bold transition-all"
            >
              <Briefcase size={14} />
              View Hiring Roles
            </Link>
            <Link 
              to={`/innovex?id=${encodeURIComponent(companyId || "")}`}
              className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-xs font-bold transition-all"
            >
              <Lightbulb size={14} />
              View Innovation Profile
            </Link>
          </div>
        </div>
      </div>

      {!company && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-lg flex items-start gap-3 mb-6">
           <AlertTriangle size={20} className="shrink-0 mt-0.5" />
           <p className="text-sm"><strong>Primary Intelligence Unavailable:</strong> Core corporate data (`companies_json`) has not been synced. Showing auxiliary intelligence modules.</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex-wrap h-auto justify-start bg-transparent p-0 gap-2 mb-2 border-b border-border pb-px rounded-none">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Overview</TabsTrigger>
          <TabsTrigger value="hiring" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Hiring</TabsTrigger>
          <TabsTrigger value="tech" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Tech</TabsTrigger>
          <TabsTrigger value="culture" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Culture</TabsTrigger>
          <TabsTrigger value="finance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Finance</TabsTrigger>
          <TabsTrigger value="growth" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Growth</TabsTrigger>
          <TabsTrigger value="innovation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Innovation</TabsTrigger>
          <TabsTrigger value="locations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Locations</TabsTrigger>
          <TabsTrigger value="benefits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Benefits</TabsTrigger>
          <TabsTrigger value="risks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Risks</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          <TabCard title="Overview">
            <TableDataRow label="Overview Text" value={company?.overview?.description} />
            <TableDataRow label="Nature Of Company" value={company?.overview?.nature_of_company} />
            <TableDataRow label="Core Value Proposition" value={company?.business_model?.value_proposition} />
            <TableDataRow label="Vision Statement" value={company?.overview?.vision} />
            <TableDataRow label="Mission Statement" value={company?.overview?.mission} />
            <TableDataRow label="Core Values" value={company?.overview?.values} />
            <TableDataRow label="Unique Differentiators" value={company?.market?.advantages} />
            <TableDataRow label="Competitive Advantages" value={company?.market?.advantages} />
            <TableDataRow label="Weaknesses / Gaps" value={company?.market?.weaknesses} />
            <TableDataRow label="Key Competitors" value={company?.market?.competitors} />
            <TableDataRow label="Target Customers" value={company?.business_model?.target_customers} />
            <TableDataRow label="Top Clients" value={company?.market?.top_clients} />
            <TableDataRow label="CEO" value={company?.leadership?.ceo} />
          </TabCard>
        </TabsContent>

        {/* HIRING TAB — Full schema display */}
        <TabsContent value="hiring">
          <TabCard title="Hiring & Placement Operations">
            <TableDataRow label="Hiring Velocity" value={company?.operations?.hiring_velocity} />
            <TableDataRow label="Employee Turnover" value={company?.operations?.employee_turnover} />
            <TableDataRow label="Retention Rate" value={company?.operations?.retention} />
            <TableDataRow label="Onboarding Experience" value={company?.employee_experience?.onboarding} />
            <TableDataRow label="Mentorship" value={company?.employee_experience?.mentorship} />
          </TabCard>

          {hiring?.job_role_details && hiring.job_role_details.length > 0 ? (
            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-bold text-foreground">
                Past Recruitment Profiles
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({hiring.job_role_details.length} role{hiring.job_role_details.length > 1 ? 's' : ''} found)
                </span>
              </h3>
              {hiring.job_role_details.map((role, idx) => (
                <div key={idx} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">

                  {/* ── Role Header ── */}
                  <div className="p-5 border-b border-border/60">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {role.opportunity_type === 'Internship' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-0.5 rounded-full">
                              <GraduationCap size={11} /> Internship
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                              <Briefcase size={11} /> Full-Time
                            </span>
                          )}
                          {role.role_category && (
                            <span className="text-xs font-semibold text-muted-foreground bg-muted/50 border border-border px-2.5 py-0.5 rounded-full">
                              {role.role_category.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xl text-primary">{role.role_title}</h4>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-foreground">
                          {role.ctc_or_stipend
                            ? role.opportunity_type === 'Internship'
                              ? `₹${role.ctc_or_stipend.toLocaleString('en-IN')}/mo`
                              : `₹${(role.ctc_or_stipend / 100000).toFixed(1)} LPA`
                            : 'Not Disclosed'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{role.compensation || 'Compensation'}</div>
                      </div>
                    </div>
                  </div>

                  {/* ── Description + Perks ── */}
                  <div className="p-5 border-b border-border/60 grid md:grid-cols-2 gap-5">
                    <div>
                      <h5 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1.5">
                        <ClipboardList size={12} /> Job Description
                      </h5>
                      <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-3 rounded-md border border-border/50">
                        {role.job_description}
                      </p>
                    </div>
                    <div className="space-y-4">
                      {role.bonus && (
                        <div>
                          <h5 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1.5 flex items-center gap-1.5">
                            <DollarSign size={12} /> Bonus & Equity
                          </h5>
                          <p className="text-sm text-foreground bg-muted/20 p-3 rounded-md border border-border/50">{role.bonus}</p>
                        </div>
                      )}
                      {role.benefits_summary && (
                        <div>
                          <h5 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1.5 flex items-center gap-1.5">
                            <Gift size={12} /> Benefits
                          </h5>
                          <p className="text-sm text-foreground bg-muted/20 p-3 rounded-md border border-border/50">{role.benefits_summary}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Hiring Rounds ── */}
                  {role.hiring_rounds && role.hiring_rounds.length > 0 && (
                    <div className="p-5">
                      <h5 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4 flex items-center gap-1.5">
                        <Star size={12} /> Recruitment Pipeline — {role.hiring_rounds.length} Round{role.hiring_rounds.length > 1 ? 's' : ''}
                      </h5>
                      <div className="space-y-4">
                        {role.hiring_rounds.map((round) => (
                          <div key={round.round_number} className="bg-muted/10 rounded-lg border border-border overflow-hidden">
                            {/* Round header */}
                            <div className="flex items-center gap-3 p-3 bg-muted/20 border-b border-border/50">
                              <span className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-sm font-black text-primary shrink-0">
                                {round.round_number}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-foreground">{round.round_name}</div>
                                <div className="text-xs text-muted-foreground">{round.round_category}</div>
                              </div>
                              <div className="flex flex-wrap justify-end gap-1.5 shrink-0">
                                {round.evaluation_type && (
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                    round.evaluation_type === 'HR'
                                      ? 'bg-lime-500/10 text-lime-500 border-lime-500/20'
                                      : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                  }`}>
                                    {round.evaluation_type}
                                  </span>
                                )}
                                {round.assessment_mode && (
                                  <span className="text-xs font-semibold bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <MonitorSmartphone size={10} /> {round.assessment_mode}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Skill sets */}
                            {round.skill_sets && round.skill_sets.length > 0 && (
                              <div className="p-3 space-y-3">
                                {round.skill_sets.map((skillSet, sIdx) => {
                                  const meta = SKILL_SET_LABELS[skillSet.skill_set_code] || {
                                    label: skillSet.skill_set_code,
                                    color: 'bg-muted text-muted-foreground border-border',
                                  };
                                  const questions = skillSet.typical_questions
                                    ? skillSet.typical_questions.split(';').map((q: string) => q.trim()).filter(Boolean)
                                    : [];
                                  return (
                                    <div key={sIdx} className="bg-card rounded-md border border-border/60 p-3">
                                      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border mb-2 ${meta.color}`}>
                                        <Brain size={10} className="mr-1" />{meta.label}
                                      </span>
                                      {questions.length > 0 && (
                                        <ul className="mt-1.5 space-y-1.5">
                                          {questions.map((q: string, qIdx: number) => (
                                            <li key={qIdx} className="flex items-start gap-2 text-sm text-foreground">
                                              <ChevronRight size={14} className="text-primary shrink-0 mt-0.5" />
                                              <span>{q}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 p-6 rounded-xl border border-dashed border-border text-center text-muted-foreground text-sm">
              No recruitment profiles found for this company.
            </div>
          )}
        </TabsContent>

        {/* TECH TAB */}
        <TabsContent value="tech">
          <TabCard title="Technology & Stack">
            <TableDataRow label="Core Tech Stack" value={company?.technology?.stack || company?.technology?.tech_stack} />
            <TableDataRow label="AI Adoption Level" value={company?.technology?.ai_level} />
            <TableDataRow label="AI Implementation" value={company?.technology?.ai_adoption} />
            <TableDataRow label="Cybersecurity Stance" value={company?.technology?.security || company?.technology?.cybersecurity} />
            <TableDataRow label="R&D Focus" value={company?.advanced?.rnd} />
            <TableDataRow label="IP Portfolio" value={company?.advanced?.ip} />
          </TabCard>
        </TabsContent>

        {/* CULTURE TAB */}
        <TabsContent value="culture">
          <TabCard title="Culture & Workplace">
            <TableDataRow label="Work Model" value={company?.culture?.work_model} />
            <TableDataRow label="Working Hours" value={company?.culture?.hours} />
            <TableDataRow label="Manager Quality" value={company?.culture?.manager_quality} />
            <TableDataRow label="Psychological Safety" value={company?.culture?.psychological_safety} />
            <TableDataRow label="Diversity & Inclusion" value={company?.culture?.diversity_inclusion} />
            <TableDataRow label="Ethical Standards" value={company?.culture?.ethical_standards} />
            <TableDataRow label="Burnout Risk" value={company?.culture?.burnout_risk} />
          </TabCard>
        </TabsContent>

        {/* FINANCE TAB */}
        <TabsContent value="finance">
          <TabCard title="Financial Profile">
            <TableDataRow label="Annual Revenue" value={company?.financials?.revenue} />
            <TableDataRow label="Profitability" value={company?.financials?.profitability || company?.financials?.profit} />
            <TableDataRow label="Valuation" value={company?.financials?.valuation} />
            <TableDataRow label="Revenue Mix" value={company?.financials?.revenue_mix} />
            <TableDataRow label="Burn Rate" value={company?.financials?.burn_rate} />
            <TableDataRow label="Runway" value={company?.financials?.runway} />
            <TableDataRow label="Investors" value={company?.ecosystem?.investors} />
          </TabCard>
        </TabsContent>

        {/* GROWTH TAB */}
        <TabsContent value="growth">
          <TabCard title="Growth & Strategy">
            <TableDataRow label="YoY Growth Rate" value={company?.financials?.growth} />
            <TableDataRow label="Strategic Priorities" value={company?.strategy?.priorities} />
            <TableDataRow label="Future Projections" value={company?.strategy?.future || company?.strategy?.future_projection} />
            <TableDataRow label="Go-To-Market (GTM)" value={company?.strategy?.gtm} />
            <TableDataRow label="Career Growth" value={company?.growth?.career} />
            <TableDataRow label="Learning Opportunities" value={company?.growth?.learning} />
            <TableDataRow label="Market Share" value={company?.market?.market_share} />
          </TabCard>
        </TabsContent>

        {/* INNOVATION TAB */}
        <TabsContent value="innovation">
          <TabCard title="Innovation & Innovex Analytics">
            <TableDataRow label="Core Business Model" value={innovex?.innovx_master?.core_business_model} />
            
            {innovex?.strategic_pillars && innovex.strategic_pillars.length > 0 && (
               <div className="mt-6 mb-4">
                 <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest mb-3">Strategic Pillars</h3>
                 <div className="space-y-2">
                   {innovex.strategic_pillars.map((pillar, i) => (
                     <div key={i} className="p-3 bg-muted/20 border border-border rounded-md">
                       <strong className="text-sm block text-foreground mb-1">{pillar.pillar_name}</strong>
                       <span className="text-sm text-muted-foreground">{pillar.description}</span>
                     </div>
                   ))}
                 </div>
               </div>
            )}

            {innovex?.industry_trends && innovex.industry_trends.length > 0 && (
               <div className="mt-6 mb-6">
                 <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest mb-3">Industry Trends Tracker</h3>
                 <div className="space-y-2">
                   {innovex.industry_trends.map((trend, i) => (
                     <div key={i} className="p-3 bg-muted/20 border border-border rounded-md flex justify-between items-start gap-4">
                       <div>
                         <strong className="text-sm block text-foreground mb-1">{trend.trend_name}</strong>
                         <span className="text-sm text-muted-foreground">{trend.description}</span>
                       </div>
                       {trend.impact_level && (
                         <span className="chip bg-primary/10 text-primary border-primary/20 shrink-0">{trend.impact_level}</span>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
            )}

            {innovex?.innovx_projects && innovex.innovx_projects.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest mb-4">Company Specific Innovation Projects</h3>
                <div className="space-y-6">
                  {innovex.innovx_projects.map((project, i) => (
                    <div key={i} className="bg-card rounded-xl border-l-4 border-l-primary border border-border shadow-md overflow-hidden relative group">
                      <div className="p-6">
                        {/* Project Header */}
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{project.project_name}</h4>
                          {project.tier_level && (
                            <span className="text-[10px] font-black bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full uppercase tracking-tighter">
                              {project.tier_level}
                            </span>
                          )}
                        </div>

                        {/* Problem & Objective */}
                        <div className="space-y-4 mb-6">
                          <div>
                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <AlertTriangle size={12} className="text-amber-500" /> Problem Statement
                            </div>
                            <p className="text-sm text-foreground/90">{project.problem_statement}</p>
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Lightbulb size={12} className="text-yellow-500" /> Innovation Objective
                            </div>
                            <p className="text-sm text-foreground/90">{project.innovation_objective}</p>
                          </div>
                        </div>

                        {/* Business Value Highlight */}
                        <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg mb-6">
                          <div className="text-sm font-bold text-primary flex items-center gap-2">
                             <Zap size={14} /> Business Value: <span className="font-medium text-foreground/90">{project.business_value}</span>
                          </div>
                        </div>

                        {/* Tech & Metrics Grid */}
                        <div className="flex flex-wrap gap-2">
                          {project.primary_use_case && (
                            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md border border-border/50 text-xs font-semibold">
                              <Target size={12} className="text-muted-foreground" />
                              <span className="text-muted-foreground">Use Case:</span>
                              <span className="text-foreground">{project.primary_use_case}</span>
                            </div>
                          )}
                          
                          {project.success_metrics && project.success_metrics.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md border border-border/50 text-xs font-semibold">
                              <Layers size={12} className="text-muted-foreground" />
                              <span className="text-muted-foreground">Metrics:</span>
                              <span className="text-foreground">{project.success_metrics.join(", ")}</span>
                            </div>
                          )}

                          {project.ai_ml_technologies && project.ai_ml_technologies.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-md border border-purple-500/20 text-xs font-semibold">
                              <Cpu size={12} className="text-purple-500" />
                              <span className="text-purple-500/80">AI/ML Tech:</span>
                              <span className="text-purple-600 dark:text-purple-400">{project.ai_ml_technologies.join(", ")}</span>
                            </div>
                          )}

                          {project.backend_technologies && project.backend_technologies.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-md border border-border/50 text-xs font-semibold">
                              <Database size={12} className="text-muted-foreground" />
                              <span className="text-muted-foreground">Backend:</span>
                              <span className="text-foreground">{project.backend_technologies.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabCard>
        </TabsContent>

        {/* LOCATIONS TAB */}
        <TabsContent value="locations">
          <TabCard title="Global Presence & Locations">
            <TableDataRow label="Global Headquarters" value={company?.overview?.headquarters} />
            <TableDataRow label="Operating Countries" value={company?.operations?.countries} />
            <TableDataRow label="Office Locations / Hubs" value={company?.operations?.office_locations} />
            <TableDataRow label="Total Office Count" value={company?.operations?.office_count} />
            <TableDataRow label="Geographic Focus" value={innovex?.innovx_master?.geographic_focus} />
            <TableDataRow label="Office Location Vibe" value={company?.infrastructure?.location} />
            <TableDataRow label="Transport/Commute" value={company?.infrastructure?.transport} />
          </TabCard>
        </TabsContent>

        {/* BENEFITS TAB */}
        <TabsContent value="benefits">
          <TabCard title="Benefits & Compensation">
            <TableDataRow label="Base Salary" value={company?.benefits?.salary} />
            <TableDataRow label="Bonus / Equity" value={company?.benefits?.bonus} />
            <TableDataRow label="Health & Insurance" value={company?.benefits?.insurance} />
            <TableDataRow label="Wellness Programs" value={company?.benefits?.wellness} />
            <TableDataRow label="Paid Time Off (PTO)" value={company?.work_environment?.leave} />
            <TableDataRow label="Work Flexibility" value={company?.work_environment?.flexibility} />
            <TableDataRow label="Overtime Policy" value={company?.work_environment?.overtime} />
          </TabCard>
        </TabsContent>

        {/* RISKS TAB */}
        <TabsContent value="risks">
          <TabCard title="Risk Assessment">
            <TableDataRow label="Overall Risk Level" value={company?.final_assessment?.risk_level} />
            <TableDataRow label="Layoff History/Risk" value={company?.risks?.layoffs} />
            <TableDataRow label="Macro Economic Risk" value={company?.risks?.macro || company?.advanced?.macro_risk} />
            <TableDataRow label="Regulatory Scrutiny" value={company?.advanced?.regulatory} />
            <TableDataRow label="Geopolitical Risk" value={company?.advanced?.geopolitical} />
            <TableDataRow label="Crisis Behavior" value={company?.final_assessment?.crisis_behavior} />
            <TableDataRow label="Long-term Sustainability" value={company?.final_assessment?.sustainability} />
          </TabCard>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
