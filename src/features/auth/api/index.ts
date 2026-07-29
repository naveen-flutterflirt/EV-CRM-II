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

export async function sendOtpApi(email: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post("/auth/send-otp", { email });
  return res.data;
}

export async function verifyOtpApi(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post("/auth/verify-otp", { email, otp });
  return res.data;
}
