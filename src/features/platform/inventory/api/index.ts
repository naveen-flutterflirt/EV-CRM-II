import api from "../../../../config/axios";
import { SparePart } from "../types";

export async function fetchInventoryPartsApi(): Promise<SparePart[]> {
  try {
    const res = await api.get("/v1/admin/inventory");
    return res.data;
  } catch {
    return [
      {
        id: "part_1",
        sku: "SP-BRK-001",
        name: "Ather Ceramic Brake Pads",
        category: "Braking",
        brand: "Ather",
        pricePaise: 65000,
        stockQty: 14,
        compatibleModels: ["Ather 450X Gen 3"],
        gstRatePct: 18,
      },
    ];
  }
}
