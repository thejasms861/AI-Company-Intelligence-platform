import { useMemo, useState } from "react";
import { LayoutGrid, Building2 } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import CompanyCard from "@/components/company/CompanyCard";
import AppLayout from "@/components/layout/AppLayout";
import { useSearchParams } from "react-router-dom";
import { getDepartmentsForCompany } from "@/utils/departments";

export default function CategoriesPage() {
  const { data: companies = [] } = useCompanies();
  const [searchParams] = useSearchParams();
  const selectedQuery = searchParams.get("q") || "";
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDept, setSelectedDept] = useState<string>("All");

  // First filter companies based on department
  const filteredByDeptCompanies = useMemo(() => {
    if (selectedDept === "All") return companies;
    return companies.filter(c => 
      getDepartmentsForCompany(c.name, c.category || "").includes(selectedDept)
    );
  }, [companies, selectedDept]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof companies>();
    filteredByDeptCompanies.forEach((c) => {
      const cat = c.category || "Uncategorized";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(c);
    });
    
    // Sort companies alphabetically within each category
    for (const [key, value] of map.entries()) {
      value.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return map;
  }, [filteredByDeptCompanies]);

  const categories = Array.from(grouped.keys()).sort();
  const displayedCategories = selectedCategory === "All" ? categories : [selectedCategory];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <LayoutGrid size={22} className="text-primary" />
            Categories
          </h1>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Department Filter */}
            <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg border border-border/50">
              <span className="text-xs text-muted-foreground px-2 font-medium uppercase tracking-wider">Dept:</span>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedCategory("All"); // Reset category filter when department changes to avoid empty state
                }}
                className="bg-transparent text-sm text-foreground focus:outline-none pr-3 py-1 cursor-pointer w-full sm:w-auto"
              >
                <option value="All" className="bg-slate-900 text-slate-200">All Departments</option>
                <option value="CSE" className="bg-slate-900 text-slate-200">CSE</option>
                <option value="ISE" className="bg-slate-900 text-slate-200">ISE</option>
                <option value="ECE" className="bg-slate-900 text-slate-200">ECE</option>
                <option value="MECH" className="bg-slate-900 text-slate-200">MECH</option>
              </select>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg border border-border/50">
                <span className="text-xs text-muted-foreground px-2 font-medium uppercase tracking-wider">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-sm text-foreground focus:outline-none pr-3 py-1 cursor-pointer w-full sm:w-auto"
                >
                  <option value="All" className="bg-slate-900 text-slate-200">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-slate-200">
                      {c} ({grouped.get(c)?.length})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16 surface-card">
            <Building2 size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No categories available. Connect your database to see company categories.
            </p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {displayedCategories.map((cat) => (
              <div key={cat} className="mb-6 break-inside-avoid bg-slate-900/40 p-5 rounded-2xl border border-border/40 hover:border-primary/30 transition-colors">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-primary/20 rounded-lg">
                    <Building2 size={18} className="text-primary" />
                  </div>
                  {cat}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    ({grouped.get(cat)?.length})
                  </span>
                </h2>
                <div className="flex flex-col gap-3">
                  {grouped.get(cat)?.map((c) => (
                    <CompanyCard key={c.company_id} company={c} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
