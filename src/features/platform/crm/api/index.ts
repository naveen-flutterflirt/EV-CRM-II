import api from "../../../../config/axios";
import { CustomerProfile } from "../types";

export async function fetchCustomerDirectoryApi(): Promise<CustomerProfile[]> {
  try {
    const res = await api.get("/v1/admin/customers");
    return res.data;
  } catch {
    return [
      {
        id: "usr_101",
        name: "Rahul Sharma",
        phone: "9876543210",
        role: "customer",
        vehicles: [],
      },
    ];
  }
}
