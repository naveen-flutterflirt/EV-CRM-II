export type UserRole =
  | "super_admin"
  | "admin"
  | "branch_manager"
  | "service_advisor"
  | "technician"
  | "inventory_manager"
  | "billing_staff"
  | "customer";

export const PLATFORM_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "branch_manager",
  "service_advisor",
  "technician",
  "inventory_manager",
  "billing_staff",
];

export const PORTAL_ROLES: UserRole[] = ["customer"];

export function isPlatformRole(role?: string): boolean {
  if (!role) return false;
  return PLATFORM_ROLES.includes(role as UserRole);
}

export function isPortalRole(role?: string): boolean {
  if (!role) return false;
  return PORTAL_ROLES.includes(role as UserRole);
}
