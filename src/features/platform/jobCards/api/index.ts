import api from "../../../../config/axios";
import { JobCard, CreateJobCardPayload } from "../types";

export async function fetchJobCardsApi(): Promise<JobCard[]> {
  try {
    const res = await api.get("/v1/admin/job-cards");
    return res.data;
  } catch {
    return [
      {
        id: "JC-1001",
        vehicleId: "veh_1",
        customerName: "Rahul Sharma",
        customerPhone: "9876543210",
        status: "IN_SERVICE",
        totalAmountPaise: 145000,
        openedAt: new Date().toISOString(),
        technicianName: "Suresh (Technician)",
      },
    ];
  }
}

export async function createJobCardApi(payload: CreateJobCardPayload): Promise<JobCard> {
  const res = await api.post("/v1/admin/job-cards", payload);
  return res.data;
}
