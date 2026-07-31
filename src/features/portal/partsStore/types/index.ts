export interface BackendPart {
  partId: string;
  partNumber: string;
  partName: string;
  categoryId?: string;
  hsnCode?: string;
  uom: string;
  isSerialized: boolean;
  isBattery: boolean;
  defaultGstRate: number | string;
  mrp: number | string;
  standardCost?: number | string;
  reorderLevel?: number;
  isActive?: boolean;
  qtyOnHand?: number;
  category?: {
    categoryId: string;
    categoryName: string;
  };
}

export interface PartCategory {
  categoryId: string;
  categoryName: string;
  parentId?: string | null;
}

export interface PartsFilter {
  search?: string;
  q?: string;
  categoryId?: string;
  isBattery?: boolean | string;
  isSerialized?: boolean | string;
  sortBy?: 'partName' | 'mrp' | 'partNumber' | 'createdAt';
  orderBy?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface PartsPaginatedResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  pages: number;
  results?: number;
  data: BackendPart[];
}
