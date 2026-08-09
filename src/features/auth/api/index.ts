import api from "../../../config/axios";
import { LoginPayload, RegisterPayload, AuthResponse, ResetPasswordPayload } from "../types";

export async function loginUserApi(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post("/auth/login", payload);
  // Support both res.data.data (from backend response wrapper) and res.data
  return res.data?.data ? { success: true, token: res.data.data.token, user: res.data.data.user } : res.data;
}

export async function registerCustomerApi(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await api.post("/auth/register", payload);
  if (res.data?.data) {
    return {
      success: true,
      token: res.data.data.token,
      user: res.data.data.user,
      message: res.data.data.message || res.data.message,
      email: res.data.data.email,
    };
  }
  return res.data;
}

export async function sendOtpApi(email: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post("/auth/send-otp", { email });
  return res.data;
}

export async function verifyOtpApi(email: string, otp: string): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
  const res = await api.post("/auth/verify-otp", { email, otp });
  return res.data;
}

export async function forgotPasswordApi(email: string): Promise<{ success: boolean; message: string; token?: string }> {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
}

export async function resetPasswordApi(payload: ResetPasswordPayload): Promise<{ success: boolean; message: string }> {
  const res = await api.post("/auth/reset-password", payload);
  return res.data;
}

export interface StateItem {
  id: string;
  name: string;
  gstStateCode?: string;
  region?: string;
}

export interface ServiceCenterItem {
  id: string;
  name: string;
  city?: string;
  stateId?: string;
  stateName?: string;
}

import { fetchWithTtlCache } from "../../../common/services/apiCache";

export async function fetchStatesApi(): Promise<StateItem[]> {
  return fetchWithTtlCache("states_list", async () => {
    try {
      const res = await api.get("/states");
      const rawData = res.data?.data || res.data;
      const items = Array.isArray(rawData) ? rawData : (rawData?.rows || []);
      if (Array.isArray(items)) {
        return items.map((item: any) => ({
          id: item.stateId || item.id,
          name: item.stateName || item.name,
          gstStateCode: item.gstStateCode,
          region: item.region,
        }));
      }
      return [];
    } catch (err: any) {
      console.error("❌ fetchStatesApi error:", err);
      return [];
    }
  }, 1000 * 60 * 30); // 30 minutes cache TTL
}

export async function fetchServiceCentersApi(stateId?: string, stateName?: string): Promise<ServiceCenterItem[]> {
  const cacheKey = `service_centers_${stateId || ''}_${stateName || ''}`;
  return fetchWithTtlCache(cacheKey, async () => {
    try {
      let url = "/service-centers?limit=100";
      if (stateId) {
        url += `&stateId=${encodeURIComponent(stateId)}`;
      } else if (stateName) {
        url += `&stateName=${encodeURIComponent(stateName)}`;
      }
      const res = await api.get(url);
      const rawData = res.data?.data || res.data;
      const items = Array.isArray(rawData) ? rawData : (rawData?.rows || []);
      if (Array.isArray(items)) {
        return items.map((item: any) => ({
          id: item.centerId || item.id,
          name: item.centerName || item.name,
          city: item.city || "",
          stateId: item.stateId || item.state?.stateId || "",
          stateName: item.state?.stateName || stateName || "",
        }));
      }
      return [];
    } catch (err: any) {
      console.error("❌ fetchServiceCentersApi error:", err);
      return [];
    }
  }, 1000 * 60 * 15); // 15 minutes cache TTL
}
