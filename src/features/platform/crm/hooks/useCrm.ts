import { useQuery } from "@tanstack/react-query";
import { fetchCustomerDirectoryApi } from "../api";

export function useCustomerDirectory() {
  return useQuery({
    queryKey: ["platform", "crm", "customers"],
    queryFn: fetchCustomerDirectoryApi,
  });
}
