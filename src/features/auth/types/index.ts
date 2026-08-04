export interface LoginPayload {
  email: string;
  password?: string;
  role?: string;
  phone?: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  altPhone?: string;
  isFleet?: boolean;
  streetAddress?: string;
  state?: string;
  state_id?: string;
  stateId?: string;
  registered_center_id?: string;
  registeredCenterId?: string;
  city?: string;
  pincode?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
  email?: string;
}
export interface ResetPasswordPayload {
  token: string;
  password?: string;
}
