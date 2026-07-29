import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverviewApi } from "../api";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["platform", "dashboard", "overview"],
    queryFn: fetchDashboardOverviewApi,
  });
}
