import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "../../../../config/axios";
import { fetchPartsCatalogApi, fetchPartCategoriesApi } from "../api";
import { PartsFilter } from "../types";

export function usePartsCatalog(filter?: PartsFilter) {
  return useQuery({
    queryKey: ["portal", "parts", filter],
    queryFn: () => fetchPartsCatalogApi(filter),
    placeholderData: (previousData) => previousData,
  });
}

export function useInfinitePartsCatalog(filter?: PartsFilter, pageSize = 12) {
  return useInfiniteQuery({
    queryKey: ["portal", "parts", "infinite", filter, pageSize],
    queryFn: ({ pageParam = 1 }) =>
      fetchPartsCatalogApi({
        ...filter,
        page: pageParam as number,
        limit: pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function usePartCategories() {
  return useQuery({
    queryKey: ["portal", "part-categories"],
    queryFn: fetchPartCategoriesApi,
    staleTime: 1000 * 60 * 15,
  });
}

export function useUserVehicles() {
  return useQuery({
    queryKey: ["portal", "user-vehicles"],
    queryFn: async () => {
      try {
        const res = await api.get("/vehicles");
        const data = res.data?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
        return [
          {
            id: "veh_101",
            brand: "Ather",
            model: "450X Gen 3",
          },
        ];
      } catch {
        return [
          {
            id: "veh_101",
            brand: "Ather",
            model: "450X Gen 3",
          },
        ];
      }
    },
  });
}
