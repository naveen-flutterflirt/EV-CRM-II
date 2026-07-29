import { useQuery } from "@tanstack/react-query";
import { fetchInventoryPartsApi } from "../api";

export function useInventory() {
  return useQuery({
    queryKey: ["platform", "inventory"],
    queryFn: fetchInventoryPartsApi,
  });
}
