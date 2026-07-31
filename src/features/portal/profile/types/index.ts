export interface UserProfileData {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  avatarUrl?: string;
}

export type OrderStatusType =
  | "Out for delivery"
  | "Delivered"
  | "Return Requested"
  | "Return Completed"
  | "Processing";

export interface OrderItem {
  id: string;
  orderNumber: string;
  title: string;
  date: string;
  totalPaid: number;
  currency: string;
  status: OrderStatusType;
  category: "ACTIVE" | "PAST" | "RETURNS";
  imageType?: "charger" | "mats" | "aeroblade" | "brakes" | "mirror" | "cable" | "bulb" | "sensor";
}

export type OrderTabType = "Active Orders" | "Past Orders" | "Returns";
