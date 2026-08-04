import api from "../../../../config/axios";
import { CustomerDashboardData } from "../types";



export async function fetchCustomerDashboardApi(): Promise<CustomerDashboardData> {
  try {
    // 1. Fetch user data first to obtain customerId for scoping
    const userRes = await api.get("/auth/me");
    const userData = userRes.data?.data || userRes.data;
    const customerId = userData?.customerId;

    if (!customerId) {
      throw new Error("Customer profile ID not found in /auth/me");
    }

    // 2. Fetch customer-scoped vehicles and job-cards using customerId filter
    const vehicleUrl = `/vehicles?customerId=${customerId}`;
    const jobCardUrl = `/job-cards?customerId=${customerId}`;

    const [vehicleRes, activitiesRes] = await Promise.allSettled([
      api.get(vehicleUrl),
      api.get(jobCardUrl),
    ]);

    const vehicleData = vehicleRes.status === "fulfilled" ? vehicleRes.value.data?.data || vehicleRes.value.data : null;
    const activityData = activitiesRes.status === "fulfilled" ? activitiesRes.value.data?.data || activitiesRes.value.data : null;

    const firstVehicle = Array.isArray(vehicleData) && vehicleData.length > 0 ? vehicleData[0] : vehicleData;
    const vehicleList = Array.isArray(vehicleData) ? vehicleData : (vehicleData?.data && Array.isArray(vehicleData.data) ? vehicleData.data : (firstVehicle ? [firstVehicle] : []));
    const totalVehiclesCount = vehicleList.length || 0;

    return {
      user: {
        id: userData?.id || userData?.userId || "",
        customerId: userData?.customerId || undefined,
        name: userData?.name || userData?.fullName || "",
        location: userData?.city || userData?.location || "",
        avatarUrl: userData?.avatarUrl || undefined,
        branch: userData?.homeCenter?.centerName || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
      },
      vehicle: firstVehicle
        ? {
            id: firstVehicle.id || firstVehicle.vehicleId || "",
            brand: (() => {
              const rawBrand = firstVehicle.brand || firstVehicle.manufacturerName || firstVehicle.model?.manufacturer;
              if (!rawBrand) return "";
              if (typeof rawBrand === 'object') {
                return (rawBrand as any).manufacturerName || (rawBrand as any).name || "";
              }
              return String(rawBrand);
            })(),
            model: (() => {
              const rawModel = firstVehicle.modelName || firstVehicle.model;
              if (!rawModel) return "";
              if (typeof rawModel === 'object') {
                return (rawModel as any).modelName || (rawModel as any).name || "";
              }
              return String(rawModel);
            })(),
            warrantyStatus: firstVehicle.warrantyStatus || (firstVehicle.warrantyEnd ? "Active Warranty" : "WARRANTY ACTIVE"),
            batteryHealthPct: firstVehicle.batteryHealthPct || firstVehicle.batterySohInPct || 0,
            currentRangeKm: firstVehicle.currentRangeKm || firstVehicle.rangeKm || 0,
            totalVehiclesCount: totalVehiclesCount,
          }
        : {
            id: "",
            brand: "",
            model: "",
            warrantyStatus: "",
            batteryHealthPct: 0,
            currentRangeKm: 0,
            totalVehiclesCount: 0,
          },
      recentActivities: Array.isArray(activityData) && activityData.length > 0
        ? activityData.map((act: any, idx: number) => ({
            id: act.id || act.jobCardId || `act_${idx}`,
            title: act.serviceName || act.title || act.jobNumber || "Service Activity",
            date: act.completedAt || act.openedAt || act.date || "",
            type: act.status || "completed",
            subtitle: `${act.openedAt || act.date || ''} • ${act.status || 'Status'}`,
          }))
        : [],
    };
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to load dashboard from database";
    console.error("❌ Customer Dashboard API Error:", errorMsg);
    throw new Error(errorMsg);
  }
}
