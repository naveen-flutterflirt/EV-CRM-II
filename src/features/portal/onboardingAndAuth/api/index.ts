import api from "../../../../config/axios";
import { CustomerProfileSetup, SavedAddress } from "../types";

export async function updateCustomerProfileApi(payload: CustomerProfileSetup) {
  const res = await api.patch("/v1/customer/profile", payload);
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
