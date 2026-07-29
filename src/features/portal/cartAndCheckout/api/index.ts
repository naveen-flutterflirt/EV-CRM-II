import api from "../../../../config/axios";
import { CheckoutPayload } from "../types";

export async function processCheckoutApi(payload: CheckoutPayload) {
  const res = await api.post("/purchase-orders", payload);
  return res.data?.data || res.data;
}
