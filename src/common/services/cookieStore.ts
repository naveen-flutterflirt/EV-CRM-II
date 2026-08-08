import Cookies from "js-cookie";

const memoryStore: Record<string, string> = {};

export const cookieStore = {
  get: (key: string): string | undefined => {
    try {
      if (typeof document !== "undefined") {
        return Cookies.get(key) || memoryStore[key];
      }
      return memoryStore[key];
    } catch (_e) {
      return memoryStore[key];
    }
  },

  set: (key: string, value: string, options?: any): void => {
    try {
      memoryStore[key] = value;
      if (typeof document !== "undefined") {
        Cookies.set(key, value, options);
      }
    } catch (_e) {
      memoryStore[key] = value;
    }
  },

  remove: (key: string): void => {
    try {
      delete memoryStore[key];
      if (typeof document !== "undefined") {
        Cookies.remove(key);
      }
    } catch (_e) {
      delete memoryStore[key];
    }
  },
};

export default cookieStore;
