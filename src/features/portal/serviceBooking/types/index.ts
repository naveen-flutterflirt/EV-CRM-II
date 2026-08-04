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

export interface StateItem {
  stateId: string;
  stateName: string;
}

export interface ServiceCenter {
  centerId: string;
  centerName: string;
  centerCode?: string;
  stateId?: string;
}

export interface CustomerSelect {
  customerId: string;
  firstName?: string;
  lastName?: string;
  name: string;
  customerCode?: string;
}

export interface VehicleSelect {
  vehicleId: string;
  registrationNo: string;
  customerId: string;
}

export interface ServiceBaySelect {
  bayId: string;
  bayCode: string;
  bayType?: string;
}

