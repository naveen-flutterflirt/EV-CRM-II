import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomerVehiclesApi, addCustomerVehicleApi } from "../api";
import { AddVehiclePayload } from "../types";

export function useCustomerVehicles(customerId?: string) {
  const queryClient = useQueryClient();

  const vehiclesQuery = useQuery({
    queryKey: ["customerVehicles", customerId],
    queryFn: () => fetchCustomerVehiclesApi(customerId),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });

  const addVehicleMutation = useMutation({
    mutationFn: (payload: AddVehiclePayload) => addCustomerVehicleApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerVehicles"] });
      queryClient.invalidateQueries({ queryKey: ["customerDashboard"] });
    },
  });

  return {
    vehicles: vehiclesQuery.data || [],
    isLoading: vehiclesQuery.isLoading,
    isError: vehiclesQuery.isError,
    refetchVehicles: vehiclesQuery.refetch,
    addVehicle: addVehicleMutation.mutateAsync,
    isAdding: addVehicleMutation.isPending,
  };
}
