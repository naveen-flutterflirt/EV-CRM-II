import api from "../../../../config/axios";
import { Vehicle, AddVehiclePayload, VehicleManufacturerMeta } from "../types";

export async function fetchCustomerVehiclesApi(customerId?: string): Promise<Vehicle[]> {
  try {
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId) {
      const userRes = await api.get("/auth/me");
      const userData = userRes.data?.data || userRes.data;
      resolvedCustomerId = userData?.customerId;
    }

    if (!resolvedCustomerId) {
      throw new Error("Customer profile ID not found. Please complete profile setup.");
    }

    const res = await api.get(`/vehicles?customerId=${resolvedCustomerId}`);
    const rawData = res.data?.data || res.data;

    if (Array.isArray(rawData)) {
      return rawData.map((item: any, idx: number) => ({
        id: item.id || item.vehicleId || `veh_${idx}`,
        brand: typeof item.brand === "object"
          ? item.brand?.manufacturerName || item.brand?.name || ""
          : item.brand || item.manufacturerName || item.model?.manufacturer?.name || "",
        model: typeof item.model === "object"
          ? item.model?.modelName || item.model?.name || ""
          : item.model || item.modelName || "",
        registrationNumber: item.registrationNo || item.registrationNumber || "",
        vin: item.vin || item.chassisNumber || "",
        motorNo: item.motorNo || "",
        color: item.color || "",
        batteryHealthPct: item.batteryHealthPct || item.batterySohInPct || 0,
        currentRangeKm: item.currentRangeKm || item.rangeKm || 0,
        warrantyStatus: item.warrantyStatus || (item.warrantyEnd ? "Active Warranty" : "Standard"),
        motorPower: item.motorNo ? `Motor: ${item.motorNo}` : "",
        purchaseDate: item.purchaseDate || "",
        lastServicedDate: item.lastServicedDate || "",
        status: item.status || "active",
        isPrimary: idx === 0,
      }));
    }
    return [];
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || "Failed to fetch customer vehicles from database";
    console.error("❌ Fetch Customer Vehicles API Error:", errorMsg);
    throw new Error(errorMsg);
  }
}

// Fetch live Vehicle Meta (Brands and Models) from GET /api/auth/vehicle-meta
export async function fetchVehicleMetaApi(): Promise<VehicleManufacturerMeta[]> {
  try {
    const res = await api.get("/auth/vehicle-meta");
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || "Failed to fetch vehicle meta from database";
    console.error("❌ Fetch Vehicle Meta API Error:", errorMsg);
    throw new Error(errorMsg);
  }
}

export async function addCustomerVehicleApi(payload: AddVehiclePayload): Promise<Vehicle> {
  try {
    let resolvedCustomerId = payload.customerId;
    if (!resolvedCustomerId) {
      const userRes = await api.get("/auth/me");
      const userData = userRes.data?.data || userRes.data;
      resolvedCustomerId = userData?.customerId;
    }

    if (!resolvedCustomerId) {
      throw new Error("Customer profile not found. Please set up profile first.");
    }

    const postBody: Record<string, any> = {
      customerId: resolvedCustomerId,
      modelId: payload.modelId,
      registrationNo: payload.registrationNumber || undefined,
      vin: payload.vin || undefined,
      motorNo: payload.motorNo || undefined,
      color: payload.color || undefined,
      purchaseDate: payload.purchaseDate || undefined,
      odometerKm: payload.odometerKm !== undefined ? Number(payload.odometerKm) : 0,
      status: payload.status || "active",
    };

    const res = await api.post("/vehicles", postBody);
    const data = res.data?.data || res.data;

    return {
      id: data.vehicleId || data.id,
      brand: payload.brand,
      model: payload.model,
      registrationNumber: payload.registrationNumber,
      vin: payload.vin || data.vin,
      motorNo: payload.motorNo || data.motorNo,
      color: payload.color || data.color,
      batteryHealthPct: 100,
      currentRangeKm: 0,
      warrantyStatus: "Registered",
      motorPower: payload.motorNo ? `Motor: ${payload.motorNo}` : "",
      purchaseDate: payload.purchaseDate || new Date().toISOString().split("T")[0],
      status: payload.status || "active",
      isPrimary: false,
    };
  } catch (err: any) {
    const errorMsg = err.response?.data?.errors
      ? Array.isArray(err.response.data.errors)
        ? err.response.data.errors.join(", ")
        : err.response.data.errors
      : err.response?.data?.message || err.message || "Failed to create vehicle in database via POST /api/vehicles";
    console.error("❌ POST /api/vehicles Error:", errorMsg);
    throw new Error(errorMsg);
  }
}
