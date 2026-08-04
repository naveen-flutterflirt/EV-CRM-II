export interface ServiceSlot {
  id: string;
  timeSlot: string;
  availableCount: number;
}

export interface BookingPayload {
  customerId: string;
  vehicleId: string;
  centerId: string;
  scheduledAt: string; // ISO DateTime string
  channel?: string;
  jobType?: string;
  complaintText?: string;
}
