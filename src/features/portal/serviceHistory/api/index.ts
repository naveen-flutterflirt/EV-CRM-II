import api from "../../../../config/axios";
import { getAuthMeCached } from "../../../../common/services/authCache";
import { ServiceRecord } from "../types";

export async function fetchServiceHistoryApi(): Promise<ServiceRecord[]> {
  try {
    const userRes = await getAuthMeCached();
    const user = userRes.data?.data || userRes.data;
    const customerId = user?.customerId;
    if (!customerId) return [];

    const res = await api.get(`/job-cards?customerId=${customerId}`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  } catch (_e) {
    return [];
  }
}
