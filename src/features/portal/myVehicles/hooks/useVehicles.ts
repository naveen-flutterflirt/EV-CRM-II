import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomerVehiclesApi, addCustomerVehicleApi } from "../api";
import { AddVehiclePayload } from "../types";

export function useCustomerVehicles(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["portal", "vehicles"],
    queryFn: fetchCustomerVehiclesApi,
    ...options,
  });
}

export function useAddCustomerVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddVehiclePayload) => addCustomerVehicleApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal", "vehicles"] });
    },
  });
}
