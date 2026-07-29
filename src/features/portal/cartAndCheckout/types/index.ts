import { SparePart } from "../../../../common/types";

export interface CartItem {
  part: SparePart;
  qty: number;
}

export interface CheckoutPayload {
  items: CartItem[];
  deliveryType: "SHIP" | "STORE_PICKUP";
  addressId?: string;
  paymentGateway: "RAZORPAY" | "COD";
}
