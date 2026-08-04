import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAvailableSlotsApi, createBookingApi, fetchServiceCentersApi } from "../api";
import { BookingPayload } from "../types";

export function useServiceCenters() {
  return useQuery({
    queryKey: ["portal", "serviceCenters"],
    queryFn: fetchServiceCentersApi,
  });
}

export function useAvailableSlots(date: string) {
  return useQuery({
    queryKey: ["portal", "slots", date],
    queryFn: () => fetchAvailableSlotsApi(date),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookingPayload) => createBookingApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["portal", "appointments"] });
      queryClient.invalidateQueries({ queryKey: ["portal", "jobCards"] });
      queryClient.invalidateQueries({ queryKey: ["portal", "customer", "dashboard"] });
    },
  });
}
