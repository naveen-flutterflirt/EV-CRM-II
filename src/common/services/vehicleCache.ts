import api from '../../config/axios';
import { fetchWithTtlCache, invalidateCacheKey } from './apiCache';

export async function fetchRawVehiclesCached(customerId: string, forceRefresh = false): Promise<any[]> {
  const cacheKey = `customer_vehicles_raw_${customerId}`;
  return fetchWithTtlCache(cacheKey, async () => {
    const res = await api.get(`/vehicles?customerId=${customerId}`);
    const rawData = res.data?.data || res.data;
    return Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
  }, 1000 * 60 * 5, forceRefresh); // 5 minutes cache TTL
}

export function invalidateVehiclesCache(customerId: string) {
  invalidateCacheKey(`customer_vehicles_raw_${customerId}`);
}
