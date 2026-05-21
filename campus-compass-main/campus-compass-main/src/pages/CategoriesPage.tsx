import { useMemo } from "react";
import { LayoutGrid, Building2 } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import CompanyCard from "@/components/company/CompanyCard";
import AppLayout from "@/components/layout/AppLayout";
import { useSearchParams } from "react-router-dom";

export default function CategoriesPage() {
  const { data: companies = [] } = useCompanies();
  const [searchParams] = useSearchParams();
  const selectedQuery = searchParams.get("q") || "";

  const grouped = useMemo(() => {
    const map = new Map<string, typeof companies>();
    companies.forEach((c) => {
      const cat = c.category || "Uncategorized";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(c);
    });
    return map;
  }, [companies]);

  const categories = Array.from(grouped.keys()).sort();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <LayoutGrid size={22} className="text-primary" />
          Categories
        </h1>

        {categories.length === 0 ? (
          <div className="text-center py-16 surface-card">
            <Building2 size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No categories available. Connect your database to see company categories.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat}>
                <h2 className="section-header mb-3">
                  <Building2 size={16} className="text-primary" />
                  {cat}
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    ({grouped.get(cat)?.length})
                  </span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
