export interface UserProfile {
  id?: string;
  customerId?: string;
  name: string;
  location: string;
  avatarUrl?: string;
  branch?: string;
  email?: string;
  phone?: string;
}

export interface CustomerVehicleStatus {
  id: string;
  brand: string;
  model: string;
  warrantyStatus: string;
  batteryHealthPct: number;
  currentRangeKm: number;
  totalVehiclesCount: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  date: string;
  type: string;
  subtitle: string;
}

export interface CustomerDashboardData {
  user: UserProfile;
  vehicle: CustomerVehicleStatus;
  recentActivities: ActivityItem[];
}
