import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import CompanyCard from "@/components/company/CompanyCard";
import AppLayout from "@/components/layout/AppLayout";

type SortKey = "name" | "employee_size" | "yoy_growth_rate" | "brand_value";

export default function ExplorePage() {
  const { data: companies = [] } = useCompanies();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(companies.map((c) => c.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [companies]);

  const filtered = useMemo(() => {
    let result = companies;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.short_name?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.office_locations?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      result = result.filter((c) =>
        c.category?.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }
    result = [...result].sort((a, b) => {
      const av = a[sortBy] || "";
      const bv = b[sortBy] || "";
      return String(av).localeCompare(String(bv));
    });
    return result;
  }, [companies, search, categoryFilter, sortBy]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-foreground mb-4">Explore Companies</h1>

        {/* Search & Filters Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 px-3 rounded-lg border text-sm flex items-center gap-1.5 transition-colors ${
              showFilters ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="surface-card p-4 mb-4 flex flex-wrap gap-3 animate-fade-in">
            <div>
              <label className="text-label block mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-8 px-2 rounded border bg-card text-sm text-foreground"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label block mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="h-8 px-2 rounded border bg-card text-sm text-foreground"
              >
                <option value="name">Name</option>
                <option value="employee_size">Employee Size</option>
                <option value="yoy_growth_rate">YoY Growth</option>
                <option value="operating_countries">Operating Countries</option>
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        <p className="text-xs text-muted-foreground mb-3">
          {filtered.length} {filtered.length === 1 ? "company" : "companies"} found
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 surface-card">
            <Search size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {companies.length === 0
                ? "No companies in database. Connect your data source."
                : "No companies match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, idx) => (
              <CompanyCard key={`${c.company_id}-${idx}`} company={c} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
