import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAvailableSlotsApi, createBookingApi } from "../api";
import { BookingPayload } from "../types";

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
    },
  });
}
