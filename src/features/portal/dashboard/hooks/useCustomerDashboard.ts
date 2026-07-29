import { useState, useEffect } from "react";
import { fetchCustomerDashboardApi } from "../api";
import { CustomerDashboardData } from "../types";

export function useCustomerDashboardHook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<CustomerDashboardData | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomerDashboardApi();
      setDashboardData(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return { dashboardData, loading, error, refreshDashboard: loadDashboard };
}
