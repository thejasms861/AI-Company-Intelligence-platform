import { useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useCompany, useCompanyShort, useInnovex, useHiring } from "@/hooks/useCompanies";
import CompanyDetail from "@/components/company/CompanyDetail";
import AppLayout from "@/components/layout/AppLayout";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";
  const safeId = decodeURIComponent(id || "");
  
  const { data: company, isLoading: loadingCompany } = useCompany(safeId);
  const { data: shortCompany, isLoading: loadingShort } = useCompanyShort(safeId);
  const { data: innovex, isLoading: loadingInnovex } = useInnovex(safeId);
  const { data: hiring, isLoading: loadingHiring } = useHiring(safeId);

  const isLoading = loadingCompany || loadingShort || loadingInnovex || loadingHiring;
  const hasAnyData = company || shortCompany || innovex || hiring;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 mb-6 font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Directory
        </Link>

        {isLoading && (
          <div className="text-center py-24 space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Synchronizing JSON Data...</p>
          </div>
        )}

        {!isLoading && !hasAnyData && (
          <div className="text-center py-24 surface-card border-dashed">
            <p className="text-sm text-muted-foreground">Entity JSON payload not found.</p>
          </div>
        )}

        {!isLoading && hasAnyData && (
          <CompanyDetail 
            company={company} 
            shortCompany={shortCompany} 
            innovex={innovex} 
            hiring={hiring} 
            defaultTab={defaultTab}
          />
        )}
      </div>
    </AppLayout>
  );
}
