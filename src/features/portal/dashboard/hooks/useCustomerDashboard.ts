import { useQuery } from "@tanstack/react-query";
import { fetchCustomerDashboardApi } from "../api";

export function useCustomerDashboardHook() {
  const { data: dashboardData, isLoading: loading, error, refetch } = useQuery({
    queryKey: ["portal", "customer", "dashboard"],
    queryFn: () => fetchCustomerDashboardApi(false),
  });

  const refreshDashboard = async () => {
    // Force refresh apiCache so it bypasses the TTL
    await fetchCustomerDashboardApi(true);
    await refetch();
  };

  return {
    dashboardData,
    loading,
    error: error ? error.message : null,
    refreshDashboard
  };
}
