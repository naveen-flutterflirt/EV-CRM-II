import axios from "axios";
import Cookies from "js-cookie";
import { Platform } from "react-native";

const DEFAULT_HOST = Platform.OS === "android" ? "http://192.168.1.39:5001/api" : "http://localhost:5001/api";

const api = axios.create({
  baseURL: DEFAULT_HOST,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    // Live Request Logging for Developer Verification
    console.log(`🌐 [API REQUEST] ${config.method?.toUpperCase()} -> ${config.baseURL}${config.url}`, config.data || "");

    const token = Cookies.get("token") || Cookies.get("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API RESPONSE SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status})`);
    return response;
  },
  (error) => {
    console.log(`❌ [API RESPONSE ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} ->`, error.message);

    const status = error.response?.status;
    const responseData = error.response?.data;

    let message = "Something went wrong";
    if (responseData) {
      if (typeof responseData === "string") {
        message = responseData;
      } else if (responseData.message) {
        message = responseData.message;
      } else if (responseData.error) {
        message = responseData.error;
      }
    }

    const isAuthRoute = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");
    if (status === 401 && !isAuthRoute) {
      Cookies.remove("token");
      Cookies.remove("userRole");
    }

    if (error.response) {
      error.message = message;
    }

    return Promise.reject(error);
  }
);

export default api;
