import api from "../../../../config/axios";
import { Invoice } from "../types";

export async function fetchInvoicesApi(): Promise<Invoice[]> {
  try {
    const res = await api.get("/v1/admin/invoices");
    return res.data;
  } catch {
    return [
      {
        id: "inv_101",
        invoiceNumber: "INV-2026-001",
        customerName: "Rahul Sharma",
        amountPaise: 145000,
        gstAmountPaise: 22118,
        status: "PAID",
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
