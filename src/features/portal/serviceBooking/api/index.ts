import api from "../../../../config/axios";
import { ServiceSlot, BookingPayload } from "../types";

export async function fetchAvailableSlotsApi(date: string): Promise<ServiceSlot[]> {
  const res = await api.get(`/appointments?date=${date}`);
  return res.data?.data || res.data;
}

export async function createBookingApi(payload: BookingPayload) {
  const res = await api.post("/appointments", payload);
  return res.data?.data || res.data;
}
