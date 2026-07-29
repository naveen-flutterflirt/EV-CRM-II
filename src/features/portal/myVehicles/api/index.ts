import api from "../../../../config/axios";
import { Vehicle, AddVehiclePayload } from "../types";

export async function fetchCustomerVehiclesApi(): Promise<Vehicle[]> {
  const res = await api.get("/vehicles");
  return res.data?.data || res.data;
}

export async function addCustomerVehicleApi(payload: AddVehiclePayload): Promise<Vehicle> {
  const res = await api.post("/vehicles", payload);
  return res.data?.data || res.data;
}
