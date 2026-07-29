export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amountPaise: number;
  gstAmountPaise: number;
  status: "PAID" | "PENDING" | "REFUNDED";
  createdAt: string;
}
