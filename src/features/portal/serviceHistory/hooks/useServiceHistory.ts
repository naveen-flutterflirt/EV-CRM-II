import { useQuery } from "@tanstack/react-query";
import { fetchServiceHistoryApi } from "../api";

export function useServiceHistory() {
  return useQuery({
    queryKey: ["portal", "serviceHistory"],
    queryFn: fetchServiceHistoryApi,
  });
}
