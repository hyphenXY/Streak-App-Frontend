import axios from "axios";

const api = axios.create({
  baseURL: "https://your-backend.com",
  withCredentials: true,   // 🔥 important for sending refresh-token cookie
});

// Interceptor: Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = global.accessToken; // stored in memory for now

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Auto refresh token
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        // Call refresh token endpoint
        const res = await api.post("/auth/refresh");

        global.accessToken = res.data.accessToken;

        // retry original request
        err.config.headers["Authorization"] = `Bearer ${global.accessToken}`;
        return api(err.config);
      } catch {
        console.log("Refresh token failed");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
