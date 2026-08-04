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
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}
export interface ResetPasswordPayload {
  token: string;
  password?: string;
}
