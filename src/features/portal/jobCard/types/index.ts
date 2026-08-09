export interface JobCard {
  jobCardId: string;
  jobNumber: string;
  customerId: string;
  vehicleId: string;
  isVirtual?: boolean;
  appointmentId?: string;
  appointment?: {
    appointmentId: string;
    apptNumber: string;
    scheduledAt: string;
    status?: string;
  };
  bay?: {
    bayId: string;
    bayCode: string;
    bayType?: string;
  };
  status: 'open' | 'in_diagnosis' | 'awaiting_approval' | 'awaiting_parts' | 'in_progress' | 'quality_check' | 'ready' | 'delivered' | 'cancelled' | 'reopened';
  jobType: string;
  priority: string;
  odometerInKm?: number;
  batterySohInPct?: number;
  reportedComplaint?: string;
  openedAt: string;
  closedAt?: string;
  promisedAt?: string;
  serviceAdvisor?: {
    employeeId: string;
    firstName: string;
    lastName: string;
  };
  leadTechnician?: {
    employeeId: string;
    firstName: string;
    lastName: string;
  };
  center?: {
    centerId: string;
    centerName: string;
    centerCode: string;
    address?: string;
    gstin?: string;
  };
  vehicle?: {
    vehicleId: string;
    registrationNo: string;
    vin: string;
  };
}

export interface JobStatusHistory {
  id: string;
  jobCardId: string;
  oldStatus?: string;
  newStatus: string;
  changedAt: string;
  remarks?: string;
}

export interface JobService {
  jobServiceId: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'in_progress' | 'completed';
  labourCharge: number;
}

export interface JobPart {
  jobPartId: string;
  partId: string;
  partName: string;
  qty: number;
  status: 'pending' | 'in_progress' | 'completed' | 'fitted';
  unitPrice: number;
}

export interface JobInspection {
  inspectionId: string;
  checkpoint: string;
  result: 'passed' | 'failed' | 'warning';
  notes?: string;
  inspectedAt: string;
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  jobCardId: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  discountAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
  invoiceDate: string;
  createdAt?: string;
  updatedAt?: string;
  paymentStatus?: string;
  towingCharges?: number | string;
  towingDistanceKm?: number;
  gstRate?: number;
  rsaJobCard?: any;
  laborTotal?: number;
  gstAmount?: number;
  paidAmount?: number;
  paidAt?: string;
}

export interface Estimate {
  estimateId: string;
  id?: string;
  jobCardId: string;
  isApproved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  appointmentId: string;
  apptNumber: string;
  customerId: string;
  vehicleId: string;
  centerId: string;
  status: 'requested' | 'confirmed' | 'rescheduled' | 'checked_in' | 'no_show' | 'cancelled' | 'completed';
  jobType: string;
  scheduledAt: string;
  center?: {
    centerId: string;
    centerName: string;
    centerCode: string;
    address?: string;
    gstin?: string;
  };
  vehicle?: {
    vehicleId: string;
    registrationNo: string;
    vin: string;
  };
}

export interface RsaRequest {
  requestId: string;
  requestNumber: string;
  customerId: string;
  vehicleId: string;
  centerId?: string;
  channel: string;
  status: string;
  issueType: string;
  issueDescription?: string;
  breakdownLatitude: number;
  breakdownLongitude: number;
  breakdownAddress?: string;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
  isBilled?: boolean;
  isClosed?: boolean;
  enrouteAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  assignments?: RsaAssignment[];
  customer?: {
    customerId: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  vehicle?: {
    vehicleId: string;
    registrationNo: string;
    vin: string;
    color?: string;
    model?: {
      modelName: string;
    };
  };
  vehiclePlate?: string;
  center?: {
    centerId: string;
    centerName: string;
    centerCode: string;
    address?: string;
    gstin?: string;
  };
}

export interface RsaAssignment {
  assignmentId: string;
  requestId: string;
  technicianId: string;
  vanId?: string;
  etaMinutes?: number;
  status: string;
  technician?: {
    employeeId: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  van?: {
    vanId: string;
    vanCode: string;
    registrationNo: string;
    makeModel: string;
  };
  createdAt: string;
  updatedAt: string;
}
