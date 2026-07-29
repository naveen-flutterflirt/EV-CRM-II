import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSavedAddressesApi, updateCustomerProfileApi } from "../api";
import { CustomerProfileSetup } from "../types";

export function useSavedAddresses() {
  return useQuery({
    queryKey: ["portal", "customer", "addresses"],
    queryFn: fetchSavedAddressesApi,
  });
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerProfileSetup) => updateCustomerProfileApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal", "customer"] });
    },
  });
}
