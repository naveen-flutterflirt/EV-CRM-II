import api from "../../../../config/axios";
import { FeedbackSubmission, SupportTicket } from "../types";

export async function submitServiceFeedbackApi(payload: FeedbackSubmission) {
  const res = await api.post("/feedback", payload);
  return res.data?.data || res.data;
}

export async function fetchSupportTicketsApi(): Promise<SupportTicket[]> {
  const res = await api.get("/feedback");
  return res.data?.data || res.data;
}
