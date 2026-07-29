export interface TrackingStep {
  label: string;
  time: string;
  status: "completed" | "current" | "upcoming";
}

export interface LiveTrackingStatus {
  jobCardId: string;
  vehicleName: string;
  registrationNumber: string;
  currentStatus: string;
  steps: TrackingStep[];
  extraWorkRecommended?: {
    description: string;
    costPaise: number;
    approved: boolean;
  };
}
