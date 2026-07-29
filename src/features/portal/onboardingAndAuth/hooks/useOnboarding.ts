import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSavedAddressesApi,
  updateCustomerProfileApi,
  fetchVehicleMetaApi,
  addCustomerVehicleApi,
} from "../api";
import { CustomerProfileSetup, VehicleSetupPayload } from "../types";

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

export function useVehicleMeta() {
  return useQuery({
    queryKey: ["portal", "vehicle", "meta"],
    queryFn: fetchVehicleMetaApi,
  });
}

export function useAddCustomerVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VehicleSetupPayload) => addCustomerVehicleApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal", "customer", "vehicles"] });
    },
  });
}
