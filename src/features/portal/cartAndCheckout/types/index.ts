import { BackendPart } from "../../partsStore/types";

export interface CartItem {
  part: BackendPart;
  quantity: number;
}

export interface DeliveryAddress {
  id: string;
  title: string;
  address: string;
  pinCode?: string;
  landmark?: string;
}

export interface CheckoutPayload {
  items: CartItem[];
  deliveryType: "SHIP" | "STORE_PICKUP";
  address: DeliveryAddress;
  paymentGateway: "RAZORPAY" | "COD";
  promoCode?: string;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
}
