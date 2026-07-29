export interface ServiceSlot {
  id: string;
  timeSlot: string;
  availableCount: number;
}

export interface BookingPayload {
  vehicleId: string;
  serviceType: string;
  date: string;
  slotId: string;
  pickupRequired: boolean;
}
