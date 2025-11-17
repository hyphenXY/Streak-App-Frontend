import api from "./api";
import type { AxiosRequestHeaders } from "axios";
import { ACCESS_TOKEN_KEY } from "../constants";

/**
 * Strategy:
 * - We keep accessToken in-memory on global.__ACCESS_TOKEN (or in a module variable)
 * - Request interceptor attaches Authorization header
 * - Response interceptor handles 401:
 *    - If refresh is already happening, queue the failed request
 *    - Otherwise call /auth/refresh to obtain new accessToken (backend reads HttpOnly cookie)
 *    - Retry queued requests after refresh
 */

// tiny helper types
type ResolveFunc = (value?: any) => void;
type RejectFunc = (reason?: any) => void;

let isRefreshing = false;
let failedQueue: Array<{ resolve: ResolveFunc; reject: RejectFunc; config: any }> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      if (token) p.config.headers["Authorization"] = `Bearer ${token}`;
      p.resolve(api(p.config));
    }
  });
  failedQueue = [];
}

// in-memory token
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  // optionally save to secure storage
  // SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token)
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use(
  (config) => {
    if (!config.headers) config.headers = {} as AxiosRequestHeaders;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);


// handle responses
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // if no response or not 401, just reject
    if (!err.response || err.response.status !== 401) {
      return Promise.reject(err);
    }

    // mark to avoid infinite loop
    if (originalRequest._retry) {
      return Promise.reject(err);
    }
    originalRequest._retry = true;

    if (isRefreshing) {
      // queue it
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    isRefreshing = true;

    try {
      // Call your refresh endpoint; backend should read HttpOnly refresh cookie and return new access token
      const resp = await api.post("/auth/refresh"); // withCredentials true
      const newToken = resp.data?.accessToken;
      if (!newToken) throw new Error("No access token from refresh");

      setAccessToken(newToken);
      processQueue(null, newToken);
      isRefreshing = false;

      // attach to original and retry
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      isRefreshing = false;
      // optionally: notify logout across app
      return Promise.reject(refreshErr);
    }
  }
);

export default api;
