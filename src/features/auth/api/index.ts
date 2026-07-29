import api from "../../../config/axios";
import { LoginPayload, RegisterPayload, AuthResponse } from "../types";

export async function loginUserApi(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post("/auth/login", payload);
  // Support both res.data.data (from backend response wrapper) and res.data
  return res.data?.data ? { success: true, token: res.data.data.token, user: res.data.data.user } : res.data;
}

export async function registerCustomerApi(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await api.post("/auth/register", payload);
  return res.data?.data ? { success: true, token: res.data.data.token, user: res.data.data.user } : res.data;
}
