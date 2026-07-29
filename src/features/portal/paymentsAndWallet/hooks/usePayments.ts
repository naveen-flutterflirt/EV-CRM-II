import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchPaymentHistoryApi, createPaymentIntentApi } from "../api";
import { PaymentIntentPayload } from "../types";

export function usePaymentHistory() {
  return useQuery({
    queryKey: ["portal", "payments", "history"],
    queryFn: fetchPaymentHistoryApi,
  });
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (payload: PaymentIntentPayload) => createPaymentIntentApi(payload),
  });
}
