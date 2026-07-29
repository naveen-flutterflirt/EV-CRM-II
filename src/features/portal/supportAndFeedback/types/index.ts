export interface FeedbackSubmission {
  jobCardId: string;
  rating: number; // 1 to 5
  comments: string;
  npsScore?: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}
