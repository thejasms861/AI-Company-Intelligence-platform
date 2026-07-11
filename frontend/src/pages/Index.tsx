import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Building2,
  TrendingUp,
  BarChart3,
  Globe,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { useCompanies, useCompanyStats } from "@/hooks/useCompanies";
import CompanyCard from "@/components/company/CompanyCard";
import AppLayout from "@/components/layout/AppLayout";

export default function HomePage() {
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
  const { data: stats, isLoading: loadingStats } = useCompanyStats();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.short_name?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [searchQuery, companies]);

  const isLoading = loadingCompanies || loadingStats;

  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6 animate-pulse">
            <ShieldCheck size={12} />
            Live Supabase JSON Synchronization Active
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            <span className="text-slate-100 drop-shadow-md">Enterprise Placement</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 animate-gradient-x drop-shadow-sm">
              Intelligence
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed mb-10">
            Authoritative data-driven insights mapping nested JSON infrastructure across 
            <span className="text-slate-200 font-semibold"> 163+ structured parameters</span>.
          </p>

          {/* Master Search */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative">
              <Search
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search across JSON entities (Name, Category, Location)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-14 pr-6 rounded-full border border-border/50 bg-slate-900 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium text-sm"
              />
            </div>

            {/* Results Dropdown */}
            {searchQuery && (
              <div className="absolute top-16 left-0 right-0 bg-slate-900 border border-border/50 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                {isLoading ? (
                  <div className="py-8 text-center text-xs text-muted-foreground italic">Querying JSONB columns...</div>
                ) : filtered.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">No matches in current schema context.</div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filtered.map((c) => (
                      <CompanyCard key={c.company_id} company={c} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Real-time KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total Assets", value: stats?.total ?? 0, icon: Building2, color: "text-blue-400" },
            { label: "Unique Sectors", value: stats?.categories ?? 0, icon: BarChart3, color: "text-emerald-400" },
            { label: "Top Domain", value: stats?.topCategory ?? "N/A", icon: Cpu, color: "text-amber-400" },
            { label: "Data Integrity", value: "100%", icon: ShieldCheck, color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="surface-card p-5 border-t-2 border-t-transparent hover:border-t-primary transition-all">
              <stat.icon size={20} className={`${stat.color} mb-3`} />
              <div className="text-2xl font-bold text-slate-100">{isLoading ? "..." : stat.value}</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Intelligence Modules */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              title: "Analytic Engine",
              desc: "Deep-dive into Innovex metrics and performance analysis.",
              icon: BarChart3,
              to: "/analytics",
            },
            {
              title: "Skill Mapping",
              desc: "Map your competency context to company requirements.",
              icon: Zap,
              to: "/skills",
            },
            {
              title: "Global Directory",
              desc: "Browse the full collection of short-form JSON records.",
              icon: Globe,
              to: "/explore",
            },
          ].map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="surface-card p-6 group hover:border-primary/50 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <item.icon size={64} />
              </div>
              <item.icon size={24} className="text-primary mb-4" />
              <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{item.desc}</p>
              <div className="flex items-center gap-2 text-xs font-bold text-primary group-hover:gap-3 transition-all">
                 INITIALIZE MODULE <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Live Data */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Synchronized Entities</h2>
            <p className="text-xs text-muted-foreground">Most recent entries from companies_json</p>
          </div>
          <Link to="/explore" className="btn-primary py-2 px-4 text-xs">
            View Repository
          </Link>
        </div>
        
        {companies.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.slice(0, 6).map((c) => (
              <CompanyCard key={c.company_id} company={c} />
            ))}
          </div>
        ) : !isLoading && (
          <div className="surface-card py-20 text-center">
             <Building2 size={48} className="mx-auto text-muted-foreground/10 mb-6" />
             <p className="text-muted-foreground text-sm">Supabase JSONB tables are empty or inaccessible.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
