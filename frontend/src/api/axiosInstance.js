import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// timeout: 10s default to avoid hanging requests
const api = axios.create({ baseURL, timeout: 10000 });

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
