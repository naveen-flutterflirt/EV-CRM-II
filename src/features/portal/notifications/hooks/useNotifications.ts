import { useQuery } from "@tanstack/react-query";
import { fetchNotificationsApi } from "../api";

export function useNotifications() {
  return useQuery({
    queryKey: ["portal", "notifications"],
    queryFn: fetchNotificationsApi,
  });
}
