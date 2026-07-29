export interface UserProfile {
  id?: string;
  name: string;
  location: string;
  avatarUrl?: string;
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
  type: 'completed' | 'over-the-air' | 'in-progress' | 'scheduled';
  subtitle: string;
}

export interface CustomerDashboardData {
  user: UserProfile;
  vehicle: CustomerVehicleStatus;
  recentActivities: ActivityItem[];
}
