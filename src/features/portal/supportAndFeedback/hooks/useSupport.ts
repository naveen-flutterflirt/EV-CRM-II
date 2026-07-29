import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchSupportTicketsApi, submitServiceFeedbackApi } from "../api";
import { FeedbackSubmission } from "../types";

export function useSupportTickets() {
  return useQuery({
    queryKey: ["portal", "support", "tickets"],
    queryFn: fetchSupportTicketsApi,
  });
}

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (payload: FeedbackSubmission) => submitServiceFeedbackApi(payload),
  });
}
