import { useQuery } from "@tanstack/react-query";
import { fetchPartsCatalogApi } from "../api";
import { PartsFilter } from "../types";

export function usePartsCatalog(filter?: PartsFilter) {
  return useQuery({
    queryKey: ["portal", "parts", filter],
    queryFn: () => fetchPartsCatalogApi(filter),
  });
}
