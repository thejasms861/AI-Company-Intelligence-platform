import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCompanies, useCompareCompanies } from "@/hooks/useCompanies";
import { CompanyShort } from "@/types/company";
import AppLayout from "@/components/layout/AppLayout";
import { GitCompare, Plus, X, Building2, ArrowRight } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * COMPARISON ENGINE:
 * Compares Short-JSON entities side-by-side.
 * Adheres to the 'Dashboard/List' constraints using only short_json.
 */
export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  
  const { data: allCompanies = [] } = useCompanies();
  const { data: selectedCompanies = [], isLoading } = useCompareCompanies(selectedIds);

  const addCompany = (id: string) => {
    if (selectedIds.includes(id)) return;
    const newIds = [...selectedIds, id];
    setSearchParams({ ids: newIds.join(",") });
  };

  const removeCompany = (id: string) => {
    const newIds = selectedIds.filter((i) => i !== id);
    if (newIds.length === 0) {
      searchParams.delete("ids");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ids: newIds.join(",") });
    }
  };

  const compareFields: { key: keyof CompanyShort; label: string }[] = [
    { key: "category", label: "Industry Category" },
    { key: "employee_size", label: "Employee Scale" },
    { key: "yoy_growth_rate", label: "Annual Growth" },
    { key: "operating_countries", label: "Global Presence" },
    { key: "office_locations", label: "Key Office Hubs" },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
              <GitCompare className="text-primary" />
              Side-by-Side Analysis
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Comparing authoritative short-form JSONB records</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              value=""
              onValueChange={(val) => addCompany(val)}
            >
              <SelectTrigger className="w-[240px] bg-slate-900 border-border/50 text-slate-200 h-10 px-4 rounded-lg">
                <SelectValue placeholder="Add Entity to Matrix..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-border text-slate-200">
                {allCompanies
                  .filter(c => !selectedIds.includes(String(c.company_id)))
                  .map(c => (
                    <SelectItem key={c.company_id} value={String(c.company_id)}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedIds.length === 0 ? (
          <div className="surface-card p-20 text-center border-dashed">
            <GitCompare size={48} className="mx-auto mb-4 text-muted-foreground/10" />
            <p className="text-sm text-muted-foreground italic">Initialize comparison by selecting entities from the dashboard repository.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/50 shadow-2xl">
            <table className="w-full min-w-[800px] border-collapse bg-slate-900/50">
              <thead>
                <tr>
                  <th className="p-6 bg-slate-950/50 text-left border-b border-r border-border/50 w-64">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">JSON Attribute Matrix</span>
                  </th>
                  {selectedCompanies.map((c) => (
                    <th key={c.company_id} className="p-6 bg-slate-900/80 border-b border-border/50 relative min-w-[280px]">
                      <button 
                        onClick={() => removeCompany(String(c.company_id))}
                        className="absolute top-4 right-4 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-muted-foreground transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${c.short_name?.toLowerCase().replace(/\s+/g, '')}.com&sz=128`} 
                        alt="" 
                        className="w-12 h-12 mx-auto mb-3 object-contain bg-white rounded p-1" 
                        onError={(e) => (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`}
                      />
                      <div className="text-sm font-bold text-slate-100">{c.name}</div>
                      <div className="text-[10px] text-primary/70 font-mono mt-1 uppercase">ID: {c.company_id}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {compareFields.map((field) => (
                  <tr key={field.key} className="hover:bg-primary/5 transition-colors">
                    <td className="p-4 border-r border-border/50 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-950/20">{field.label}</td>
                    {selectedCompanies.map((c) => (
                      <td key={c.company_id} className="p-4 text-xs text-slate-300 leading-relaxed">
                        {c[field.key] || <span className="text-muted-foreground/30 italic">Not Available</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                   <td className="p-4 border-r border-border/50 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-950/20">Final Intelligence</td>
                   {selectedCompanies.map((c) => (
                    <td key={c.company_id} className="p-4">
                       <Link 
                        to={`/company/${c.company_id}`}
                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                       >
                         DEEP ANALYZE FULL_JSON <ArrowRight size={12} />
                       </Link>
                    </td>
                   ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
