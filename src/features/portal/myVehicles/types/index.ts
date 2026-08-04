export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registrationNumber?: string;
  vin?: string;
  motorNo?: string;
  color?: string;
  batteryHealthPct?: number;
  currentRangeKm?: number;
  warrantyStatus?: string;
  motorPower?: string;
  purchaseDate?: string;
  lastServicedDate?: string;
  batteryCapacityKwh?: string | number;
  status?: 'active' | 'sold' | 'scrapped' | 'stolen';
  isPrimary?: boolean;
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
