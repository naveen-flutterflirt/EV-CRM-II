import api from "../../../config/axios";
import { LoginPayload, RegisterPayload, AuthResponse, ResetPasswordPayload } from "../types";

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

export async function forgotPasswordApi(email: string): Promise<{ success: boolean; message: string; token?: string }> {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
}

export async function resetPasswordApi(payload: ResetPasswordPayload): Promise<{ success: boolean; message: string }> {
  const res = await api.post("/auth/reset-password", payload);
  return res.data;
}
