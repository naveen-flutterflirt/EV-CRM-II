import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJobCardsApi, createJobCardApi } from "../api";
import { CreateJobCardPayload } from "../types";

export function useJobCards() {
  return useQuery({
    queryKey: ["platform", "jobCards"],
    queryFn: fetchJobCardsApi,
  });
}

export function useCreateJobCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateJobCardPayload) => createJobCardApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform", "jobCards"] });
    },
  });
}
