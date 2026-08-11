import api from "../../../../config/axios";
import { fetchRawVehiclesCached } from "../../../../common/services/vehicleCache";
import {
  ServiceSlot,
  BookingPayload,
  StateItem,
  ServiceCenter,
  CustomerSelect,
  VehicleSelect,
  ServiceBaySelect
} from "../types";

export interface ServiceCenterResponse {
  centerId: string;
  centerName: string;
  centerCode: string;
  city: string;
  serviceBays: number;
}

export async function fetchServiceCentersApi(): Promise<ServiceCenterResponse[]> {
  const res = await api.get("/service-centers");
  const rawData = res.data?.data || res.data;
  if (Array.isArray(rawData)) return rawData;
  if (rawData && Array.isArray(rawData.data)) return rawData.data;
  return [];
}

export async function fetchAvailableSlotsApi(date: string): Promise<ServiceSlot[]> {
  const res = await api.get(`/appointments?date=${date}`);
  return res.data?.data || res.data;
}

export async function createBookingApi(payload: BookingPayload) {
  const res = await api.post("/appointments", payload);
  return res.data?.data || res.data;
}

// ======================== BACKEND INTEGRATION FUNCTIONS ========================

export async function fetchStatesApi(): Promise<StateItem[]> {
  const res = await api.get("/states?limit=10");
  const rawData = res.data?.data || res.data;
  const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
  return list.map((s: any) => ({
    stateId: s.stateId,
    stateName: s.stateName,
  }));
}

export async function fetchCrmServiceCentersApi(stateId?: string): Promise<ServiceCenter[]> {
  let url = "/service-centers?limit=10";
  if (stateId) {
    url += `&stateId=${stateId}`;
  }
  const res = await api.get(url);
  const rawData = res.data?.data || res.data;
  const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
  return list.map((c: any) => ({
    centerId: c.centerId,
    centerName: c.centerName,
    centerCode: c.centerCode,
    stateId: c.stateId,
  }));
}

export async function fetchCrmCustomersApi(): Promise<CustomerSelect[]> {
  const res = await api.get("/customers?limit=10");
  const rawData = res.data?.data || res.data;
  const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
  return list.map((c: any) => ({
    customerId: c.customerId,
    name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer",
    customerCode: c.customerCode || `CUST-${c.customerId?.substring(0, 5)}`,
  }));
}

export async function fetchCrmVehiclesApi(customerId?: string): Promise<VehicleSelect[]> {
  let list: any[] = [];
  if (customerId) {
    list = await fetchRawVehiclesCached(customerId);
  } else {
    const url = "/vehicles";
    const res = await api.get(url);
    const rawData = res.data?.data || res.data;
    list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
  }

  return list.map((v: any) => {
    const brand = typeof v.brand === "object"
      ? v.brand?.manufacturerName || v.brand?.name || ""
      : v.brand || v.manufacturerName || v.model?.manufacturer?.name || "";
    const model = typeof v.model === "object"
      ? v.model?.modelName || v.model?.name || ""
      : v.model || v.modelName || "";
    const reg = v.registrationNo || v.registrationNumber || "";
    const displayLabel = brand || model 
      ? `${brand} ${model}${reg ? ` (${reg})` : ''}`.trim() 
      : reg || "Vehicle";

    return {
      vehicleId: v.vehicleId || v.id || v.vehicle_id || "",
      registrationNo: displayLabel,
      customerId: v.customerId || v.userId || v.customer_id || v.user_id || "",
    };
  });
}

export async function fetchCrmServiceBaysApi(centerId: string): Promise<ServiceBaySelect[]> {
  const res = await api.get(`/service-bays?limit=100&centerId=${centerId}`);
  const rawData = res.data?.data || res.data;
  const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
  return list.map((b: any) => ({
    bayId: b.bayId,
    bayCode: b.bayCode,
    bayType: b.bayType,
  }));
}

export async function fetchMeApi(): Promise<any> {
  const res = await api.get("/auth/me");
  return res.data?.data || res.data;
}

