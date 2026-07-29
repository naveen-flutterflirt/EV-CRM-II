import { Vehicle } from "../../../../common/types";

export type { Vehicle };

export interface AddVehiclePayload {
  brand: string;
  model: string;
  registrationNumber: string;
  vin?: string;
}
