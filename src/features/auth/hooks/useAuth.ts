import { useState } from "react";
import { loginUserApi, registerCustomerApi } from "../api";
import { LoginPayload, RegisterPayload } from "../types";

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

  return { login, register, loading, error };
}
