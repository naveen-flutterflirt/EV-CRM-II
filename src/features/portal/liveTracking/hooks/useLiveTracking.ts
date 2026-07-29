import { useQuery } from "@tanstack/react-query";
import { fetchLiveTrackingApi } from "../api";

export function useLiveTracking(jobCardId: string = "JC-1001") {
  return useQuery({
    queryKey: ["portal", "tracking", jobCardId],
    queryFn: () => fetchLiveTrackingApi(jobCardId),
    refetchInterval: 10000, // Poll status every 10 seconds for live updates
  });
}
