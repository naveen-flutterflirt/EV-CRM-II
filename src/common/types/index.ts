export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "super_admin" | "admin" | "branch_manager" | "service_advisor" | "technician" | "inventory_manager" | "billing_staff" | "customer";
  avatar?: string;
  createdAt?: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  vin: string;
  registrationNumber: string;
  batterySerial?: string;
  batteryHealthPct?: number;
  purchaseDate?: string;
  warrantyTill?: string;
}

export interface JobCard {
  id: string;
  bookingId?: string;
  vehicleId: string;
  vehicle?: Vehicle;
  customerName: string;
  customerPhone: string;
  status: "BOOKED" | "RECEIVED" | "ESTIMATE_PENDING" | "APPROVED" | "IN_SERVICE" | "EXTRA_WORK_PENDING" | "QC" | "READY" | "COMPLETED" | "CANCELLED";
  odometerReading?: number;
  batteryHealth?: number;
  technicianName?: string;
  totalAmountPaise: number;
  openedAt: string;
  completedAt?: string;
}

export interface SparePart {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  pricePaise: number;
  stockQty: number;
  compatibleModels: string[];
  imageUrl?: string;
  gstRatePct: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}
