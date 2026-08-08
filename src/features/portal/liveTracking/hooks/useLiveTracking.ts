import { useQuery } from "@tanstack/react-query";
import { fetchLiveTrackingApi } from "../api";

export function useLiveTracking(jobCardId: string = "JC-1001") {
  return useQuery({
    queryKey: ["portal", "tracking", jobCardId],
    queryFn: () => fetchLiveTrackingApi(jobCardId),
    enabled: !!jobCardId,
    refetchInterval: 30000, // Poll status every 30 seconds during active tracking
    staleTime: 15000,
  });
}
