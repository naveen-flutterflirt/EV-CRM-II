import api from "../../../../config/axios";
import { PartsFilter, PartsPaginatedResponse, PartCategory, BackendPart } from "../types";

export async function fetchPartsCatalogApi(filter?: PartsFilter): Promise<PartsPaginatedResponse> {
  const params: Record<string, any> = {};
  if (filter?.search) params.search = filter.search;
  if (filter?.categoryId) params.categoryId = filter.categoryId;
  if (filter?.isBattery !== undefined) params.isBattery = filter.isBattery;
  if (filter?.isSerialized !== undefined) params.isSerialized = filter.isSerialized;
  if (filter?.sortBy) params.sortBy = filter.sortBy;
  if (filter?.orderBy) params.orderBy = filter.orderBy;
  if (filter?.page) params.page = filter.page;
  if (filter?.limit) params.limit = filter.limit;

  const res = await api.get("/parts", { params });
  
  // Backend returns { success: true, total, page, limit, pages, data: [...] }
  if (res.data && Array.isArray(res.data.data)) {
    return {
      success: true,
      total: res.data.total || res.data.data.length,
      page: res.data.page || 1,
      limit: res.data.limit || 20,
      pages: res.data.pages || 1,
      data: res.data.data,
    };
  } else if (Array.isArray(res.data)) {
    return {
      success: true,
      total: res.data.length,
      page: 1,
      limit: res.data.length,
      pages: 1,
      data: res.data,
    };
  }
  
  return {
    success: true,
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
    data: [],
  };
}

export async function fetchPartCategoriesApi(): Promise<PartCategory[]> {
  const res = await api.get("/part-categories");
  if (res.data?.data && Array.isArray(res.data.data)) {
    return res.data.data;
  } else if (Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}
