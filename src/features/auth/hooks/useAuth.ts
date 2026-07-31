import { useState } from "react";
import Cookies from "js-cookie";
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
      if (res?.token) {
        Cookies.set("token", res.token, { expires: 30 });
        Cookies.set("accessToken", res.token, { expires: 30 });
        if (res.user?.role) {
          const roleCode = typeof res.user.role === 'string' ? res.user.role : res.user.role.roleCode;
          Cookies.set("userRole", roleCode || "customer", { expires: 30 });
        }
      }
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
      if (res?.token) {
        Cookies.set("token", res.token, { expires: 30 });
        Cookies.set("accessToken", res.token, { expires: 30 });
        if (res.user?.role) {
          const roleCode = typeof res.user.role === 'string' ? res.user.role : res.user.role.roleCode;
          Cookies.set("userRole", roleCode || "customer", { expires: 30 });
        }
      }
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
