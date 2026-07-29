import api from "../../../../config/axios";
import { AppNotification } from "../types";

export async function fetchNotificationsApi(): Promise<AppNotification[]> {
  const res = await api.get("/audit-logs");
  return res.data?.data || res.data;
}
