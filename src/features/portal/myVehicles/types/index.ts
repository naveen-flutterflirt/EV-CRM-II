export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  modelName?: string;
  variant?: string;
  registrationNumber?: string;
  registrationNo?: string;
  vin?: string;
  motorNo?: string;
  color?: string;
  odometerKm?: number;
  batteryHealthPct?: number;
  currentRangeKm?: number;
  warrantyStatus?: string;
  warrantyStart?: string | null;
  warrantyEnd?: string | null;
  batteryWarrantyEnd?: string | null;
  motorPower?: string;
  purchaseDate?: string;
  lastServicedDate?: string;
  batteryCapacityKwh?: string | number;
  status?: 'active' | 'sold' | 'scrapped' | 'stolen';
  isPrimary?: boolean;
  isBatterySwappable?: boolean;
}

export interface AddVehiclePayload {
  customerId?: string;
  modelId: string;
  brand: string;
  model: string;
  registrationNumber: string;
  vin?: string;
  motorNo?: string;
  color?: string;
  purchaseDate?: string;
  odometerKm?: number;
  status?: 'active' | 'sold' | 'scrapped' | 'stolen';
  warrantyStart?: string;
  warrantyEnd?: string;
  batteryWarrantyEnd?: string;
}

export interface VehicleModelMeta {
  modelId: string;
  modelName: string;
}

export interface VehicleManufacturerMeta {
  manufacturerId: string;
  name: string;
  models: VehicleModelMeta[];
}
