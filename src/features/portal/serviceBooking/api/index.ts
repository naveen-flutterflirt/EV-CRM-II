import api from "../../../../config/axios";
import { ServiceSlot, BookingPayload } from "../types";

export interface ServiceCenterResponse {
  centerId: string;
  centerName: string;
  centerCode: string;
  city: string;
  serviceBays: number;
}

export async function fetchServiceCentersApi(): Promise<ServiceCenterResponse[]> {
  const res = await api.get("/service-centers");
  // Check format: res.data.data has rows, or is an array, or res.data contains rows
  const rawData = res.data?.data || res.data;
  if (Array.isArray(rawData)) return rawData;
  if (rawData && Array.isArray(rawData.data)) return rawData.data;
  return [];
}

export async function fetchAvailableSlotsApi(date: string): Promise<ServiceSlot[]> {
  const res = await api.get(`/appointments?date=${date}`);
  return res.data?.data || res.data;
}

export async function createBookingApi(payload: BookingPayload) {
  const res = await api.post("/appointments", payload);
  return res.data?.data || res.data;
}
