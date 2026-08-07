export interface CustomerNotificationItem {
  id: string;
  title: string;
  body: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}
