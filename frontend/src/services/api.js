import axios from 'axios';

// Create configured Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token from localStorage if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('altsfoodspot_token') || localStorage.getItem('foodspot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// In-memory cache & request deduplication store
const apiCache = new Map();
const inFlightRequests = new Map();
const CACHE_TTL_MS = 45 * 1000; // 45 seconds cache for public catalog queries

// Cacheable endpoint prefixes
const CACHEABLE_ENDPOINTS = ['/restaurants', '/foods', '/coupons'];

const isCacheable = (url, method, config) => {
  if (method !== 'get' || config?.skipCache) return false;
  return CACHEABLE_ENDPOINTS.some((prefix) => url?.startsWith(prefix));
};

export const clearApiCache = () => {
  apiCache.clear();
};

// Response interceptor: Global error formatting and 401 handling
API.interceptors.response.use(
  (response) => {
    // Invalidate cache on mutations
    const method = response.config.method?.toLowerCase();
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      clearApiCache();
    }
    return response.data;
  },
  (error) => {
    // If token expired or unauthorized, clear storage
    if (error.response && error.response.status === 401) {
      const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('altsfoodspot_token');
        localStorage.removeItem('foodspot_token');
        localStorage.removeItem('altsfoodspot_user');
        localStorage.removeItem('foodspot_user');
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred. Please try again.';

    return Promise.reject(new Error(message));
  }
);

// Wrapped API.get with deduplication & caching
const originalGet = API.get.bind(API);
API.get = function (url, config = {}) {
  const method = 'get';
  if (!isCacheable(url, method, config)) {
    return originalGet(url, config);
  }

  const cacheKey = `${url}::${JSON.stringify(config.params || {})}`;

  // 1. Return fresh cached data if available
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return Promise.resolve(cached.data);
  }

  // 2. Return in-flight promise if an identical request is already underway
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. Initiate new network request
  const requestPromise = originalGet(url, config)
    .then((data) => {
      apiCache.set(cacheKey, { data, timestamp: Date.now() });
      inFlightRequests.delete(cacheKey);
      return data;
    })
    .catch((err) => {
      inFlightRequests.delete(cacheKey);
      throw err;
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

export default API;
