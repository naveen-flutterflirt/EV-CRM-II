import { useQuery } from "@tanstack/react-query";
import { fetchInvoicesApi } from "../api";

export function useInvoices() {
  return useQuery({
    queryKey: ["platform", "billing", "invoices"],
    queryFn: fetchInvoicesApi,
  });
}
