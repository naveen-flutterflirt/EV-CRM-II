import api from "../../../../config/axios";
import { CustomerOrder } from "../types";

export async function fetchCustomerOrdersApi(): Promise<CustomerOrder[]> {
  const res = await api.get("/purchase-orders");
  return res.data?.data || res.data;
}
