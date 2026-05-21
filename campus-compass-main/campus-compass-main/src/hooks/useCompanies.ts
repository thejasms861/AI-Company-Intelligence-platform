import { useQuery } from "@tanstack/react-query";
import { companyService } from "@/services/companyService";

/**
 * HOOKS LAYER:
 * Directly maps UI data requirements to the Service Layer JSON methods.
 * Ensures that components receive exactly the data structures defined in src/types/company.ts.
 */

export function useCompanies() {
  return useQuery({
    queryKey: ["companies", "short"],
    queryFn: () => companyService.getAllShort(),
  });
}

export function useCompareCompanies(ids: (string | number)[]) {
  return useQuery({
    queryKey: ["compare-companies", ids],
    queryFn: () => companyService.getMultipleShortByIds(ids),
    enabled: ids.length > 0,
  });
}

export function useCompany(id: string | number) {
  return useQuery({
    queryKey: ["company", "full", id],
    queryFn: () => companyService.getFullById(id),
    enabled: !!id,
  });
}

export function useCompanyShort(id: string | number) {
  return useQuery({
    queryKey: ["company", "short", id],
    queryFn: () => companyService.getShortById(id),
    enabled: !!id,
  });
}

export function useInnovex(id: string | number) {
  return useQuery({
    queryKey: ["innovex", id],
    queryFn: () => companyService.getInnovexData(id),
    enabled: !!id,
  });
}

export function useHiring(id: string | number) {
  return useQuery({
    queryKey: ["hiring", id],
    queryFn: () => companyService.getHiringData(id),
    enabled: !!id,
  });
}

export function useCompanySearch(query: string) {
  return useQuery({
    queryKey: ["companies", "search", query],
    queryFn: () => companyService.search(query),
    enabled: query.length > 0,
  });
}

export function useCompanyStats() {
  return useQuery({
    queryKey: ["company-stats"],
    queryFn: () => companyService.getStats(),
  });
}
