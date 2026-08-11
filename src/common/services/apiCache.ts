import api from '../../config/axios';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

const memoryCache = new Map<string, CacheEntry<any>>();

const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (_e) {}
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch (_e) {}
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (_e) {}
  },
  clear: (): void => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch (_e) {}
  }
};

export async function fetchWithTtlCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlMs = 180000, // 3 minutes default TTL
  forceRefresh = false
): Promise<T> {
  const now = Date.now();
  let entry = memoryCache.get(cacheKey);

  // If not found in memoryCache, try to recover from sessionStorage
  if (!entry) {
    const serialized = safeSessionStorage.getItem(cacheKey);
    if (serialized) {
      try {
        const parsed = JSON.parse(serialized);
        if (parsed && parsed.data !== undefined && parsed.timestamp) {
          entry = {
            data: parsed.data as T,
            timestamp: parsed.timestamp
          };
          memoryCache.set(cacheKey, entry);
        }
      } catch (_e) {
        safeSessionStorage.removeItem(cacheKey);
      }
    }
  }

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
      const timestamp = Date.now();
      memoryCache.set(cacheKey, { data, timestamp });
      
      // Persist to sessionStorage
      safeSessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp }));
      
      return data;
    } catch (err) {
      memoryCache.delete(cacheKey);
      safeSessionStorage.removeItem(cacheKey);
      throw err;
    }
  })();

  memoryCache.set(cacheKey, { data: entry?.data, timestamp: entry?.timestamp || 0, promise });
  return promise;
}

export function invalidateCacheKey(cacheKey: string) {
  memoryCache.delete(cacheKey);
  safeSessionStorage.removeItem(cacheKey);
}

export function invalidateAllCache() {
  memoryCache.clear();
  safeSessionStorage.clear();
}

