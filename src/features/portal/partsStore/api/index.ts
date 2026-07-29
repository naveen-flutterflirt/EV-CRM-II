import api from "../../../../config/axios";
import { SparePart, PartsFilter } from "../types";

export async function fetchPartsCatalogApi(filter?: PartsFilter): Promise<SparePart[]> {
  const res = await api.get("/parts", { params: filter });
  return res.data?.data || res.data;
}
