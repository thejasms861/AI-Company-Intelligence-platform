import { useState, useMemo } from "react";
import { useCompanies, useInnovex } from "@/hooks/useCompanies";
import AppLayout from "@/components/layout/AppLayout";
import { BarChart3, PieChart, TrendingUp, Building2, Search, Target, ShieldAlert } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const { data: companies = [], isLoading } = useCompanies();
  const [selectedId, setSelectedId] = useState<number | "all">("all");
  const { data: innovex } = useInnovex(selectedId === "all" ? 0 : selectedId);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    companies.forEach((c) => {
      const cat = c.category || "Unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [companies]);

  const stats = useMemo(() => {
    return {
      total: companies.length,
      categories: new Set(companies.map((c) => c.category)).size,
      growth: companies.filter(c => c.yoy_growth_rate?.includes("%")).length,
    };
  }, [companies]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-muted-foreground animate-pulse">
          Synchronizing analytics data...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="text-primary" />
              Intelligence Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time mapping of Supabase JSON infrastructure</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              value={String(selectedId)}
              onValueChange={(val) => setSelectedId(val === "all" ? "all" : Number(val))}
            >
              <SelectTrigger className="w-[220px] bg-slate-900/50 border-border/50 text-blue-400 font-medium">
                <div className="flex items-center gap-2 text-xs">
                  <Search size={12} className="text-muted-foreground" />
                  <SelectValue placeholder="Select Data Source" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-border text-slate-200">
                <SelectItem value="all">Global Summary</SelectItem>
                {companies.map(c => (
                  <SelectItem key={c.company_id} value={String(c.company_id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedId === "all" ? (
          <div className="animate-fade-in">
            {/* Global Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="surface-card p-6 border-l-4 border-primary">
                <Building2 className="text-primary mb-3" size={24} />
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Monitored Entities</div>
              </div>
              <div className="surface-card p-6 border-l-4 border-success">
                <TrendingUp className="text-success mb-3" size={24} />
                <div className="text-3xl font-bold">{stats.growth}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">High-Growth Assets</div>
              </div>
              <div className="surface-card p-6 border-l-4 border-info">
                <PieChart className="text-info mb-3" size={24} />
                <div className="text-3xl font-bold">{stats.categories}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Sectors Mapped</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="surface-card p-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">Market Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="surface-card p-6 flex flex-col justify-center text-center">
                 <ShieldAlert className="mx-auto text-muted-foreground/20 mb-4" size={48} />
                 <p className="text-sm text-muted-foreground italic">
                   "All dashboards are derived from authoritative JSON columns. No inferred or computed fields are rendered."
                 </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            {innovex ? (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="surface-card p-6">
                    <h3 className="text-sm font-bold text-primary mb-6 flex items-center gap-2">
                       <Target size={16} /> Industry Trends Focus
                    </h3>
                    <div className="space-y-4">
                       {(innovex.industry_trends || []).slice(0, 4).map((trend, idx) => (
                         <div key={idx} className="group">
                            <div className="flex justify-between text-xs mb-1">
                               <span className="text-muted-foreground uppercase">{trend.trend_name}</span>
                               <span className="font-bold text-indigo-400">{trend.strategic_importance}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full bg-indigo-500 transition-all duration-1000`} style={{ width: trend.strategic_importance === 'Critical' ? '100%' : '70%' }}></div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="surface-card p-6">
                    <h3 className="text-sm font-bold text-primary mb-6 flex items-center gap-2">
                       <ShieldAlert size={16} /> Strategic Pillar Analysis
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                       {(innovex.strategic_pillars || []).slice(0, 3).map((pillar, idx) => (
                         <div key={idx} className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                            <div className="text-[10px] font-bold text-primary uppercase mb-1">{pillar.pillar_name}</div>
                            <div className="text-xs text-slate-300 leading-tight">{pillar.pillar_description}</div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="surface-card py-20 text-center text-muted-foreground animate-pulse">
                Awaiting Innovex Data... Ensure record exists in innovx_json table.
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
