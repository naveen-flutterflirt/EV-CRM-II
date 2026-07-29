import api from "../../../../config/axios";
import { DashboardData } from "../types";

export async function fetchDashboardOverviewApi(): Promise<DashboardData> {
  try {
    const res = await api.get("/v1/admin/dashboard/overview");
    return res.data;
  } catch {
    return {
      todayRevenuePaise: 1450000,
      vehiclesInWorkshopCount: 18,
      activeJobCardsCount: 12,
      lowStockItemsCount: 3,
    };
  }
}
