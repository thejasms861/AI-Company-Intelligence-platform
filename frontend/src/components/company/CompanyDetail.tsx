import { useState } from "react";
import { Link } from "react-router-dom";
import { CompanyFull, CompanyShort, InnovexData, JobRoleDetails } from "@/types/company";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Building2, AlertTriangle, Briefcase, GraduationCap, DollarSign, Gift, Star, ChevronRight, ClipboardList, MonitorSmartphone, Brain, Lightbulb, Target, Layers, Cpu, Database, Zap, ArrowRight, MapPin, Globe, Linkedin, Twitter, Facebook, Instagram, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";

const BADGE_DESCRIPTIONS: Record<string, string> = {
  "High Volume Hiring": "This company regularly recruits hundreds to thousands of students, making it a very reliable target.",
  "Standardized Assessment": "Hiring primarily relies on large-scale aptitude and coding tests rather than resume screening.",
  "Accessible": "Less stringent on CGPA or specific college tiers; open to a wide pool of applicants.",
  "Highly Selective": "Acceptance rate is extremely low; focuses heavily on strong technical fundamentals and deep problem-solving skills.",
  "Specialized Skills": "Recruits for niche, highly technical roles requiring specific tech stacks or deep domain knowledge.",
  "High Growth": "A fast-scaling company offering rapid career progression and high learning curves.",
  "Top Tier Pay": "Compensation is in the top 5-10% of the industry standards, including heavy base pay and RSUs.",
  "Extremely Competitive": "Global talent pool competition. Requires exceptional system design, algorithmic skills, and experience.",
  "Global Impact": "Work directly impacts millions to billions of users globally.",
  "Stable Backup": "Provides reliable job security and steady growth, making it a solid foundation for career starts."
};

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
  const [selectedTier, setSelectedTier] = useState<"tier_1" | "tier_2" | "tier_3">("tier_1");
  const companyId = company?.company_id || shortCompany?.company_id;
  
  const displayName = company?.name || innovex?.innovx_master?.company_name || hiring?.company_name || "Unknown Entity";
  const displayCategory = company?.category || innovex?.innovx_master?.industry || "Category Unavailable";
  const originalLogoUrl = shortCompany?.logo_url || company?.logo_url;
  let logoUrl = typeof originalLogoUrl === 'string' ? originalLogoUrl : '';
  
  if (logoUrl) {
    if (logoUrl.includes(';') || logoUrl.includes(',')) {
      logoUrl = logoUrl.split(/[;,]/)[0].trim();
    }
    
    if (!logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
      let domain = logoUrl;
      if (logoUrl.includes('.svg') || logoUrl.includes('.png') || !logoUrl.includes('.')) {
        domain = displayName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      }
      logoUrl = `https://logo.uplead.com/${domain}`;
    }

    if (logoUrl.includes('clearbit.com')) {
      const domain = logoUrl.split('/').pop() || (displayName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '.com');
      logoUrl = `https://logo.uplead.com/${domain}`;
    }
  }
  
  // FORCE OLD LOGOS FOR SPECIFIC COMPANIES
  const forceOldLogoNames = [
    "capgemini",
    "pricewaterhouse",
    "publicis",
    "qicap",
    "redhat",
    "red hat",
    "roppen",
    "wipro",
    "zenken"
  ];
  
  if (displayName) {
    const isOldLogoCompany = forceOldLogoNames.some(n => displayName.toLowerCase().includes(n));
    if (isOldLogoCompany) {
      let fallbackDomain = displayName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + ".com";
      if (originalLogoUrl && typeof originalLogoUrl === 'string' && originalLogoUrl.includes('//')) {
        try { fallbackDomain = new URL(originalLogoUrl.split(/[;,]/)[0].trim()).hostname; } catch (e) {}
      }
      logoUrl = `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=128`;
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
              target.onerror = null; // Prevent infinite loops
              let fallbackDomain = displayName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + ".com";
              
              if (target.src.includes('duckduckgo.com')) {
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff`;
              } else if (target.src.includes('uplead.com')) {
                target.src = `https://icons.duckduckgo.com/ip3/${fallbackDomain}.ico`;
              } else {
                target.src = `https://logo.uplead.com/${fallbackDomain}`;
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
            {company?.intelligence_data?.company_tier && (
              <span className={`text-sm font-bold px-2.5 py-0.5 rounded border ${
                company.intelligence_data.company_tier.includes("Elite") ? "bg-purple-500/10 text-purple-400 border-purple-500/30" : 
                company.intelligence_data.company_tier.includes("Premium") ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" :
                company.intelligence_data.company_tier.includes("Mass") ? "bg-amber-500/10 text-amber-500 border-amber-500/30" :
                "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
              }`}>
                🏆 {company.intelligence_data.company_tier}
              </span>
            )}
          </div>

          {company?.digital_presence && (() => {
              const renderLink = (url: any, Icon: any, label: string, colorClass: string) => {
                if (!url || url === "Not Found" || url === "N/A" || url === "" || (Array.isArray(url) && url.length === 0)) return null;
                
                // If the AI generated an array, take the first link
                let rawUrl = Array.isArray(url) ? url[0] : String(url);
                
                // Aggressive Cleanup: Remove whitespace, newlines, and common markdown artifacts
                rawUrl = rawUrl.trim().replace(/[\n\r]/g, '');
                
                // Extract URL if AI accidentally wrapped it in markdown like [text](url)
                const mdMatch = rawUrl.match(/\]\((https?:\/\/[^\)]+)\)/);
                if (mdMatch) rawUrl = mdMatch[1];
                
                // Remove trailing punctuation that might have been caught in extraction
                rawUrl = rawUrl.replace(/[.,;]$/, '');

                if (!rawUrl || rawUrl === "Not Found" || rawUrl.toLowerCase() === "n/a") return null;
                
                let href = rawUrl;
                if (!href.startsWith('http')) {
                  if (label === 'Twitter') {
                    href = `https://twitter.com/${href.replace('@', '')}`;
                  } else {
                    href = `https://${href}`;
                  }
                }
                
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 text-xs text-slate-400 hover:${colorClass} transition-colors bg-muted/50 px-2.5 py-1 rounded-md border border-border`}>
                    <Icon size={14} /> {label}
                  </a>
                );
              };

              return (
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {renderLink(company.digital_presence.website, Globe, "Website", "text-primary")}
                  {renderLink(company.digital_presence.careers_page, Briefcase, "Careers", "text-[#10b981]")}
                  {renderLink(company.digital_presence.linkedin, Linkedin, "LinkedIn", "text-[#0a66c2]")}
                  {renderLink(company.digital_presence.twitter, Twitter, "Twitter", "text-[#1da1f2]")}
                  {renderLink(company.digital_presence.facebook, Facebook, "Facebook", "text-[#1877f2]")}
                  {renderLink(company.digital_presence.instagram, Instagram, "Instagram", "text-[#e1306c]")}
                </div>
              );
            })()}

          <p className="text-sm text-slate-300 mt-4 leading-relaxed max-w-4xl line-clamp-2">
            {company?.overview?.description || innovex?.innovx_master?.core_business_model || "Comprehensive intelligence profile for " + displayName}
          </p>

          {company?.intelligence_data && (
            <div className="mt-4 p-4 bg-muted/20 border border-border/50 rounded-lg max-w-4xl">
              <div className="flex items-start gap-2 mb-2">
                <Brain className="text-primary mt-0.5 shrink-0" size={16} />
                <p className="text-sm text-foreground">
                  <strong>AI Intelligence: </strong> 
                  {company.intelligence_data.reasoning}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3 bg-muted/30 p-2 rounded-lg border border-border/50">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mr-1">Campus Hiring:</span>
                
                {company.intelligence_data.campus_hiring_volumes ? (
                  <div className="flex items-center gap-2">
                    <select 
                      className="text-xs bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value as "tier_1" | "tier_2" | "tier_3")}
                    >
                      <option value="tier_1">Tier 1 Colleges</option>
                      <option value="tier_2">Tier 2 Colleges</option>
                      <option value="tier_3">Tier 3 Colleges</option>
                    </select>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded text-xs border border-primary/20 font-bold tracking-wide">
                      {company.intelligence_data.campus_hiring_volumes[selectedTier]}
                    </span>
                  </div>
                ) : (
                  <span className="bg-muted px-2 py-1 rounded text-xs text-foreground border border-border/50">
                    Data Unavailable
                  </span>
                )}
                
                <div className="w-px h-5 bg-border mx-2"></div>
                
                <TooltipProvider delayDuration={100}>
                  {company.intelligence_data.badges?.map((badge, idx) => (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <button type="button" className="bg-primary/10 text-primary px-2 py-1 rounded text-xs border border-primary/20 font-medium cursor-help focus:outline-none focus:ring-2 focus:ring-primary/30">
                          {badge}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[250px] text-xs z-[100]">
                        <p>{BADGE_DESCRIPTIONS[badge] || `Indicator for ${badge.toLowerCase()} associated with this company's hiring patterns.`}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          )}

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
          <TabsTrigger value="layoffs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Layoffs</TabsTrigger>
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
            {company?.digital_presence?.careers_page && (
              <div className="flex flex-col md:flex-row py-4 border-b border-border/50 last:border-0 gap-2 md:gap-8 hover:bg-muted/10 transition-colors px-2 rounded-md">
                <div className="md:w-1/3 text-sm font-semibold text-muted-foreground shrink-0 pt-0.5">
                  Careers Page
                </div>
                <div className="md:w-2/3 text-sm">
                  <a 
                    href={company.digital_presence.careers_page.startsWith('http') ? company.digital_presence.careers_page : `https://${company.digital_presence.careers_page}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-md border border-emerald-500/20 font-semibold"
                  >
                    <Briefcase size={14} />
                    View Open Positions →
                  </a>
                </div>
              </div>
            )}
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

        {/* LAYOFFS TAB */}
        <TabsContent value="layoffs">
          <TabCard title="Historical Layoff Data">
            <p className="text-sm text-muted-foreground mb-6">
              AI-generated summary of major layoff events based on historical data. Use this to gauge employment stability.
            </p>
            
            {(!company?.layoffs_data || !company.layoffs_data.has_layoffs) ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-emerald-500">High Stability</h3>
                <p className="text-sm text-emerald-500/80 mt-1">
                  No major public mass layoffs recorded in recent history for this company.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={company.layoffs_data.layoff_events} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="year" stroke="#888" tick={{ fill: '#888' }} />
                      <YAxis stroke="#888" tick={{ fill: '#888' }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                        itemStyle={{ color: '#ef4444' }}
                      />
                      <Bar dataKey="number_laid_off" fill="#ef4444" radius={[4, 4, 0, 0]} name="Employees Laid Off">
                        <LabelList dataKey="number_laid_off" position="top" fill="#ef4444" fontSize={12} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-8">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Detailed Layoff Events</h4>
                  <div className="space-y-3">
                    {company.layoffs_data.layoff_events.map((event, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                        <div className="flex flex-col items-center justify-center bg-red-500/10 p-3 rounded-md min-w-[80px]">
                          <span className="text-xl font-bold text-red-500">{event.year}</span>
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="font-bold text-red-500">{event.number_laid_off.toLocaleString()} employees affected</span>
                          </div>
                          <p className="text-sm text-foreground/80">
                            <strong>Roles Affected:</strong> {event.roles_affected}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
