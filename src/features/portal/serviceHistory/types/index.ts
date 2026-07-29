export interface ServiceRecord {
  id: string;
  jobCardId: string;
  vehicleRegistration: string;
  serviceDate: string;
  partsReplaced: string[];
  totalCostPaise: number;
  invoicePdfUrl?: string;
  nextServiceDueDate?: string;
}
