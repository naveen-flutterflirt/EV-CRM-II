import { JobCard } from "../../../../common/types";

export interface CreateJobCardPayload {
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  technicianId?: string;
}

export type { JobCard };
