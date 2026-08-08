import api from '../../config/axios';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export async function fetchWithTtlCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlMs = 180000, // 3 minutes default TTL
  forceRefresh = false
): Promise<T> {
  const now = Date.now();
  const entry = memoryCache.get(cacheKey);

  if (!forceRefresh && entry) {
    if (entry.data !== undefined && now - entry.timestamp < ttlMs) {
      return entry.data;
    }
    if (entry.promise) {
      return entry.promise;
    }
  }

  const promise = (async () => {
    try {
      const data = await fetcher();
      memoryCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (err) {
      memoryCache.delete(cacheKey);
      throw err;
    }
  })();

  memoryCache.set(cacheKey, { data: entry?.data, timestamp: entry?.timestamp || 0, promise });
  return promise;
}

export function invalidateCacheKey(cacheKey: string) {
  memoryCache.delete(cacheKey);
}

export function invalidateAllCache() {
  memoryCache.clear();
}
