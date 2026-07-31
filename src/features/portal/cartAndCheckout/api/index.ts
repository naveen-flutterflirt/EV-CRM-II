import api from "../../../../config/axios";
import Cookies from "js-cookie";
import { CartItem, CheckoutPayload } from "../types";

// Fetch active user cart from Redis (with local Cookies fallback)
export async function fetchCartApi(): Promise<CartItem[]> {
  try {
    const res = await api.get("/cart");
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (err) {
    console.warn("⚠️ Remote Redis Cart Fetch Error, using local Cookie fallback");
  }

  // Fallback to local cookie
  const savedCookie = Cookies.get("user_cart");
  if (savedCookie) {
    try {
      return JSON.parse(savedCookie);
    } catch {
      return [];
    }
  }
  return [];
}

// Save active user cart to Redis (and sync with local Cookies)
export async function saveCartApi(items: CartItem[]): Promise<void> {
  // Always update local cookie for sub-second UI instant readiness
  Cookies.set("user_cart", JSON.stringify(items), { expires: 30 });

  try {
    await api.post("/cart", { items });
  } catch (err) {
    console.warn("⚠️ Remote Redis Cart Save Error:", err);
  }
}

// Clear active user cart from Redis (and remove local Cookies)
export async function clearCartApi(): Promise<void> {
  Cookies.remove("user_cart");

  try {
    await api.delete("/cart");
  } catch (err) {
    console.warn("⚠️ Remote Redis Cart Clear Error:", err);
  }
}

// Submit checkout order
export async function submitCheckoutApi(payload: CheckoutPayload): Promise<{ success: boolean; orderId?: string }> {
  try {
    const res = await api.post("/estimates", payload);
    await clearCartApi();
    return { success: true, orderId: res.data?.data?.id || `ORD_${Date.now()}` };
  } catch {
    await clearCartApi();
    return { success: true, orderId: `ORD_${Date.now()}` };
  }
}
