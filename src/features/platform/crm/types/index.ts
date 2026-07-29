import { User, Vehicle } from "../../../../common/types";

export interface CustomerProfile extends User {
  vehicles: Vehicle[];
}
