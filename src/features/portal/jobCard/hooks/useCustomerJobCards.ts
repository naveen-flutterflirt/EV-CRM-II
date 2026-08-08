import { useQuery } from "@tanstack/react-query";
import api from "../../../../config/axios";

export function useCustomerJobCards(customerId?: string) {
  const query = useQuery({
    queryKey: ["customerJobCards", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const res = await api.get(`/job-cards?customerId=${customerId}`);
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });

  return {
    jobCards: query.data || [],
    isLoading: query.isLoading,
    refetchJobCards: query.refetch,
  };
}
