export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "JOB_STATUS" | "SERVICE_DUE" | "PROMO" | "PAYMENT";
  read: boolean;
  createdAt: string;
}
