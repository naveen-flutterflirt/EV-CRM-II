import api from "../../../../config/axios";
import { getAuthMeCached } from "../../../../common/services/authCache";
import { fetchWithTtlCache } from "../../../../common/services/apiCache";
import { CustomerDashboardData } from "../types";

export async function fetchCustomerDashboardApi(forceRefresh = false): Promise<CustomerDashboardData> {
  return fetchWithTtlCache("customer_dashboard", async () => {
    try {
      // 1. Fetch user data first to obtain customerId for scoping
      const userRes = await getAuthMeCached(forceRefresh);
      const userData = userRes.data?.data || userRes.data;
      const customerId = userData?.customerId;

      if (!customerId) {
        throw new Error("Customer profile ID not found in /auth/me");
      }

      // 2. Fetch customer-scoped vehicles, job-cards, and RSA requests using customerId filter
      const vehicleUrl = `/vehicles?customerId=${customerId}`;
      const jobCardUrl = `/job-cards?customerId=${customerId}`;
      const rsaUrl = `/rsa/requests?customerId=${customerId}`;

      const [vehicleRes, activitiesRes, rsaRes] = await Promise.allSettled([
        api.get(vehicleUrl),
        api.get(jobCardUrl),
        api.get(rsaUrl),
      ]);

      const vehicleData = vehicleRes.status === "fulfilled" ? vehicleRes.value.data?.data || vehicleRes.value.data : null;
      const activityData = activitiesRes.status === "fulfilled" ? activitiesRes.value.data?.data || activitiesRes.value.data : null;
      const rsaData = rsaRes.status === "fulfilled" ? rsaRes.value.data?.data || rsaRes.value.data : null;

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
            id: firstVehicle.vehicleId || firstVehicle.id || firstVehicle.vehicle_id || "",
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
        recentActivities: (() => {
          const closedJobCards = Array.isArray(activityData)
            ? activityData.filter((act: any) => act.status === "delivered" || act.status === "cancelled" || act.status === "closed" || act.status === "completed")
            : [];
          const jobCardActivities = closedJobCards.map((act: any, idx: number) => {
            const rawDate = act.closedAt || act.completedAt || act.openedAt || act.date;
            const formattedDate = formatRecentActivityDate(rawDate);
            const statusLabel = act.status === "delivered" ? "Delivered" : (act.status === "cancelled" ? "Cancelled" : act.status);
            const serviceTypeLabel = act.jobType === "scheduled_maintenance" ? "Maintenance" : (act.jobType || "Service");
            return {
              id: act.jobCardId || act.id || `act_${idx}`,
              title: act.jobNumber ? `Workshop Service: ${act.jobNumber}` : (act.serviceName || `Workshop Service (${serviceTypeLabel})`),
              date: rawDate || "",
              type: act.status || "completed",
              subtitle: `${formattedDate} • ${statusLabel}`,
            };
          });

          const closedRsaRequests = Array.isArray(rsaData)
            ? rsaData.filter((act: any) => act.status === "closed" || act.status === "resolved" || act.status === "towed" || act.status === "completed" || act.status === "cancelled")
            : [];
          const rsaActivities = closedRsaRequests.map((act: any, idx: number) => {
            const rawDate = act.resolvedAt || act.closedAt || act.requestedAt || act.createdAt;
            const formattedDate = formatRecentActivityDate(rawDate);
            const statusLabel = act.status === "closed" ? "Closed" : (act.status === "resolved" ? "Resolved" : (act.status === "towed" ? "Towed" : act.status));
            const issueLabel = act.issueType ? act.issueType.replace(/_/g, ' ').toUpperCase() : "RSA Emergency";
            return {
              id: act.requestId || act.id || `rsa_${idx}`,
              title: `Roadside Assist: ${act.requestNumber || (act.requestId && act.requestId.slice(0, 8).toUpperCase()) || "SOS"}`,
              date: rawDate || "",
              type: `rsa_${act.status || "completed"}`,
              subtitle: `${formattedDate} • ${issueLabel} • ${statusLabel}`,
            };
          });

          const combined = [...jobCardActivities, ...rsaActivities];
          combined.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
          });

          return combined;
        })(),
      };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to load dashboard from database";
      console.error("❌ Customer Dashboard API Error:", errorMsg);
      throw new Error(errorMsg);
    }
  }, 5000, forceRefresh);
}

function formatRecentActivityDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day < 10 ? '0' + day : day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}
