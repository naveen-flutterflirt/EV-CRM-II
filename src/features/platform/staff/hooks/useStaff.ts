import { useQuery } from "@tanstack/react-query";
import { fetchStaffMembersApi } from "../api";

export function useStaffMembers() {
  return useQuery({
    queryKey: ["platform", "staff"],
    queryFn: fetchStaffMembersApi,
  });
}
