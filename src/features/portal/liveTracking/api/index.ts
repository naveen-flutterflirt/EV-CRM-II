import api from "../../../../config/axios";
import { LiveTrackingStatus } from "../types";

export async function fetchLiveTrackingApi(jobCardId: string): Promise<LiveTrackingStatus> {
  const res = await api.get(`/job-cards/${jobCardId}`);
  return res.data?.data || res.data;
}
