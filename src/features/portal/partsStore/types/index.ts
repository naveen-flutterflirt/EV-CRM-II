import { SparePart } from "../../../../common/types";

export type { SparePart };

export interface BackendPart {
  id: string;
  partName?: string;
  name?: string;
  mrp?: number | string;
  pricePaise?: number;
  category?: string | { categoryName?: string };
  isBattery?: boolean;
  stockQty?: number;
  imageUrl?: string;
}

export interface PartsFilter {
  model?: string;
  category?: string;
  query?: string;
}
