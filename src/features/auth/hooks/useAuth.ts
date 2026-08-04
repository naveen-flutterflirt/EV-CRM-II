import { useState } from "react";
import { loginUserApi, registerCustomerApi, forgotPasswordApi, resetPasswordApi } from "../api";
import { LoginPayload, RegisterPayload, ResetPasswordPayload } from "../types";

export function useAuthHook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUserApi(payload);
      return res;
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerCustomerApi(payload);
      return res;
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await forgotPasswordApi(email);
      return res;
    } catch (err: any) {
      setError(err.message || "Password reset request failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (payload: ResetPasswordPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await resetPasswordApi(payload);
      return res;
    } catch (err: any) {
      setError(err.message || "Reset password failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, forgotPassword, resetPassword, loading, error };
}
