import api from '../../config/axios';

let cachedAuthMePromise: Promise<any> | null = null;
let cachedAuthMeData: any = null;
let lastAuthMeFetchTime = 0;
const CACHE_TTL_MS = 300000; // 5 minutes cache TTL

export async function getAuthMeCached(forceRefresh = false): Promise<any> {
  const now = Date.now();
  if (!forceRefresh && cachedAuthMeData && now - lastAuthMeFetchTime < CACHE_TTL_MS) {
    return cachedAuthMeData;
  }
  if (!forceRefresh && cachedAuthMePromise) {
    return cachedAuthMePromise;
  }

  cachedAuthMePromise = (async () => {
    try {
      const res = await api.get('/auth/me');
      cachedAuthMeData = res;
      lastAuthMeFetchTime = Date.now();
      return res;
    } catch (err) {
      cachedAuthMePromise = null;
      cachedAuthMeData = null;
      throw err;
    } finally {
      cachedAuthMePromise = null;
    }
  })();

  return cachedAuthMePromise;
}

export function invalidateAuthMeCache() {
  cachedAuthMePromise = null;
  cachedAuthMeData = null;
  lastAuthMeFetchTime = 0;
}

export function clearAllAuthAndApiCaches() {
  invalidateAuthMeCache();
}
