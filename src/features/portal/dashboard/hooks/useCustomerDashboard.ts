import { useQuery } from "@tanstack/react-query";
import { fetchCustomerDashboardApi } from "../api";

export function useCustomerDashboardHook() {
  const { data: dashboardData, isLoading: loading, error, refetch: refreshDashboard } = useQuery({
    queryKey: ["portal", "customer", "dashboard"],
    queryFn: () => fetchCustomerDashboardApi(),
  });

  return {
    dashboardData,
    loading,
    error: error ? error.message : null,
    refreshDashboard
  };
}
