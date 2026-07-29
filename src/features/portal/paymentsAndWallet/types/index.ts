export interface PaymentTransaction {
  id: string;
  referenceType: "ORDER" | "JOB_CARD";
  referenceId: string;
  amountPaise: number;
  gateway: "RAZORPAY" | "STRIPE";
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
}

export interface PaymentIntentPayload {
  referenceType: "ORDER" | "JOB_CARD";
  referenceId: string;
  amountPaise: number;
}
