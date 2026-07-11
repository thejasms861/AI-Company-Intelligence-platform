import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCompany, useCompanyShort, useInnovex, useHiring } from "@/hooks/useCompanies";
import CompanyDetail from "@/components/company/CompanyDetail";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { companyService } from "@/services/companyService";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-semibold"
          >
            <ArrowLeft size={16} />
            Back to Directory
          </Link>
          
          {user?.role === "developer" && hasAnyData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20">
                  <Trash2 className="w-4 h-4" />
                  Delete Profile
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the intelligence data for this company from the Supabase database. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    const success = await companyService.deleteCompany(safeId);
                    if (success) {
                      toast.success("Company profile deleted successfully");
                      navigate("/explore");
                    } else {
                      toast.error("Failed to delete company profile");
                    }
                  }} className="bg-red-500 hover:bg-red-600 text-white">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

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
