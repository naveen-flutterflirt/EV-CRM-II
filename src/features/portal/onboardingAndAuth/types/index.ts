export interface CustomerProfileSetup {
  fullName: string;
  email?: string;
  address?: string;
  city?: string;
  pincode?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  addressLine: string;
  pincode: string;
  isDefault: boolean;
}
