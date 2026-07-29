import api from "../../../../config/axios";
import { ServiceRecord } from "../types";

export async function fetchServiceHistoryApi(): Promise<ServiceRecord[]> {
  const res = await api.get("/job-cards");
  return res.data?.data || res.data;
}
