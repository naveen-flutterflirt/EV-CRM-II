import { useQuery } from "@tanstack/react-query";
import { fetchCustomerOrdersApi } from "../api";

export function useCustomerOrders() {
  return useQuery({
    queryKey: ["portal", "orders"],
    queryFn: fetchCustomerOrdersApi,
  });
}
