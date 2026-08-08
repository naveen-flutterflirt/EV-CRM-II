export interface UserProfileData {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  phone: string;
  email: string;
  gender?: string;
  addressLine1?: string;
  city?: string;
  pincode?: string;
  location?: string;
  defaultAddress?: string;
  avatarUrl?: string;
}

export interface EditProfilePayload {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  email?: string;
  gender?: string;
  addressLine1?: string;
  address?: string;
  defaultAddress?: string;
  city?: string;
  pincode?: string;
  avatarUrl?: string;
}

export interface ServiceHistoryRecord {
  id: string;
  dateStr: string;
  year: string;
  monthDay: string;
  title: string;
  kilometers: number;
  vehicleModel: string;
}

export interface LaborInspectionItem {
  id: string;
  title: string;
  subtitle: string;
  price: number;
}

export interface PartReplacedItem {
  id: string;
  partName: string;
  partNumber: string;
  price: number;
}

export interface ServiceDetailData {
  id: string;
  serviceType: string;
  serviceDate?: string;
  odometerKm?: number;
  technicianName?: string;
  technicianRating?: number;
  technicianAvatar?: string;
  laborItems: LaborInspectionItem[];
  partsReplaced: PartReplacedItem[];
  technicianNotes?: string;
  totalAmount?: number;
}

export interface SupportTicketItem {
  id: string;
  title: string;
  timeAgo: string;
  summary: string;
  status: "IN PROGRESS" | "RESOLVED";
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "Getting Started" | "Payments";
}

export type LanguageOption = "English" | "Hindi (हिंदी)" | "Spanish (Español)" | "German (Deutsch)";

export type ProfileSubView =
  | 'ACCOUNT'
  | 'VIEW_PROFILE'
  | 'EDIT_PROFILE'
  | 'SERVICE_HISTORY'
  | 'SERVICE_DETAIL'
  | 'SUPPORT_MAIN'
  | 'HELP_CENTER'
  | 'CONTACT_US'
  | 'SETTINGS'
  | 'SECURITY'
  | 'TERMS_AND_PRIVACY';
