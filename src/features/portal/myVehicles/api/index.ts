import api from "../../../../config/axios";
import { getAuthMeCached } from "../../../../common/services/authCache";
import { Vehicle, AddVehiclePayload, VehicleManufacturerMeta } from "../types";

export async function fetchCustomerVehiclesApi(customerId?: string): Promise<Vehicle[]> {
  try {
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId) {
      const userRes = await getAuthMeCached();
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
        id: item.vehicleId || item.id || item.vehicle_id || `veh_${idx}`,
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
        odometerKm: item.odometerKm !== undefined && item.odometerKm !== null
          ? Number(item.odometerKm)
          : (item.odometer_km !== undefined && item.odometer_km !== null
            ? Number(item.odometer_km)
            : (item.odometer !== undefined && item.odometer !== null
              ? Number(item.odometer)
              : (item.currentOdometer !== undefined && item.currentOdometer !== null
                ? Number(item.currentOdometer)
                : 0))),
        batteryHealthPct: item.batteryHealthPct || item.batterySohInPct || 0,
        currentRangeKm: item.currentRangeKm || item.rangeKm || 0,
        warrantyStatus: item.warrantyStatus || (item.warrantyEnd ? "Active Warranty" : "Standard"),
        warrantyStart: item.warrantyStart || item.warranty_start || "",
        warrantyEnd: item.warrantyEnd || item.warranty_end || "",
        batteryWarrantyEnd: item.batteryWarrantyEnd || item.battery_warranty_end || "",
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

export async function deleteCustomerVehicleApi(vehicleId: string): Promise<boolean> {
  try {
    await api.delete(`/vehicles/${vehicleId}`);
    return true;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || "Failed to remove vehicle from database";
    console.error("❌ DELETE /api/vehicles Error:", errorMsg);
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
      const userRes = await getAuthMeCached();
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

function toIsoDateStr(dateStr?: string): string | undefined {
  if (!dateStr || !dateStr.trim()) return undefined;
  const trimmed = dateStr.trim();
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[-/]/);
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }

  return undefined;
}

export async function updateCustomerVehicleApi(vehicleId: string, payload: Partial<AddVehiclePayload>): Promise<boolean> {
  try {
    const patchBody: Record<string, any> = {};
    if (payload.modelId) patchBody.modelId = payload.modelId;
    if (payload.registrationNumber !== undefined) patchBody.registrationNo = payload.registrationNumber;
    if (payload.vin !== undefined) patchBody.vin = payload.vin;
    if (payload.motorNo !== undefined) patchBody.motorNo = payload.motorNo;
    if (payload.color !== undefined) patchBody.color = payload.color;
    
    if (payload.purchaseDate) {
      const isoP = toIsoDateStr(payload.purchaseDate);
      if (isoP) patchBody.purchaseDate = isoP;
    }

    if (payload.odometerKm !== undefined) patchBody.odometerKm = Number(payload.odometerKm);
    if (payload.status !== undefined) patchBody.status = payload.status;
    
    if (payload.warrantyStart) {
      const isoWS = toIsoDateStr(payload.warrantyStart);
      if (isoWS) patchBody.warrantyStart = isoWS;
    }

    if (payload.warrantyEnd) {
      const isoWE = toIsoDateStr(payload.warrantyEnd);
      if (isoWE) patchBody.warrantyEnd = isoWE;
    }

    if (payload.batteryWarrantyEnd) {
      const isoBWE = toIsoDateStr(payload.batteryWarrantyEnd);
      if (isoBWE) patchBody.batteryWarrantyEnd = isoBWE;
    }

    await api.patch(`/vehicles/${vehicleId}`, patchBody);
    return true;
  } catch (err: any) {
    const errorMsg = err.response?.data?.errors
      ? Array.isArray(err.response.data.errors)
        ? err.response.data.errors.join(", ")
        : err.response.data.errors
      : err.response?.data?.message || err.message || "Failed to update vehicle in database";
    console.error("❌ PATCH /api/vehicles Error:", errorMsg);
    throw new Error(errorMsg);
  }
}
