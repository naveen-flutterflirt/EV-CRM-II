import api from "../../../../config/axios";
import { PaymentTransaction, PaymentIntentPayload } from "../types";

export async function createPaymentIntentApi(payload: PaymentIntentPayload) {
  const res = await api.post("/payments", payload);
  return res.data?.data || res.data;
}

export async function fetchPaymentHistoryApi(): Promise<PaymentTransaction[]> {
  const res = await api.get("/payments");
  return res.data?.data || res.data;
}
