import api from "../../../../config/axios";
import { CustomerNotificationItem } from "../types";

export async function fetchCustomerNotificationsApi(): Promise<CustomerNotificationItem[]> {
  try {
    const res = await api.get("/notifications");
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      return data.map((item: any, idx: number) => ({
        id: item.id || item.notificationId || `notif_${idx}`,
        title: item.title || "System Notification",
        body: item.body || item.message || "",
        type: item.type || "system",
        isRead: Boolean(item.isRead),
        createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      }));
    }
    return [];
  } catch (err: any) {
    console.warn("⚠️ Fetch Notifications API Warning:", err.message || err);
    return [];
  }
}

export const fetchNotificationsApi = fetchCustomerNotificationsApi;

export async function markNotificationAsReadApi(id: string): Promise<boolean> {
  try {
    await api.patch(`/notifications/${id}/read`);
    return true;
  } catch (err: any) {
    console.warn("⚠️ Mark Notification Read API Warning:", err.message || err);
    return false;
  }
}

export async function markAllNotificationsAsReadApi(): Promise<boolean> {
  try {
    await api.patch("/notifications/read-all");
    return true;
  } catch (err: any) {
    console.warn("⚠️ Mark All Notifications Read API Warning:", err.message || err);
    return false;
  }
}
