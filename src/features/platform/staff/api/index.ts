import api from "../../../../config/axios";
import { StaffMember } from "../types";

export async function fetchStaffMembersApi(): Promise<StaffMember[]> {
  try {
    const res = await api.get("/v1/admin/staff");
    return res.data;
  } catch {
    return [
      { id: "stf_1", name: "Suresh Tech", phone: "9811122233", role: "technician" },
      { id: "stf_2", name: "Amit Advisor", phone: "9844455566", role: "service_advisor" },
    ];
  }
}
