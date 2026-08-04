import api from "../../../../config/axios";
import { CustomerProfileSetup, SavedAddress, VehicleBrandMeta, VehicleSetupPayload } from "../types";

export async function updateCustomerProfileApi(payload: CustomerProfileSetup) {
  const res = await api.patch("/auth/setup-profile", payload);
  return res.data;
}

export async function fetchVehicleMetaApi(): Promise<VehicleBrandMeta[]> {
  const res = await api.get("/auth/vehicle-meta");
  return res.data.data;
}

export async function addCustomerVehicleApi(payload: VehicleSetupPayload) {
  const res = await api.post("/auth/setup-vehicle", payload);
  return res.data;
}

export async function fetchSavedAddressesApi(): Promise<SavedAddress[]> {
  try {
    const res = await api.get("/v1/customer/addresses");
    return res.data;
  } catch {
    return [
      { id: "addr_1", label: "Home", addressLine: "123 Green Park, Bhopal", pincode: "462001", isDefault: true },
    ];
  }
}
