import axios from "axios";
import { getToken } from "../utils/safeStorage";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// timeout: 30s to avoid spurious 10s aborts during slow networks
const api = axios.create({ baseURL, timeout: 30000 });

// Attach token automatically if present (reads token via safeStorage)
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Give friendlier message for timeouts
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.code === "ECONNABORTED" && error.message && error.message.includes("timeout")) {
      error.message = "Request timed out. Backend may be down or slow.";
    }
    return Promise.reject(error);
  }
);

export default api;
