export interface CustomerOrder {
  id: string;
  orderNumber: string;
  totalAmountPaise: number;
  status: "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  courierAwb?: string;
  itemsCount: number;
  createdAt: string;
}
