import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔒 Add a request interceptor to attach the JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  // Do not attach token for authentication routes
  if (token && !config.url.includes("/token") && !config.url.includes("/register")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 🔄 Response interceptor — if token expired (401) clear it and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      // Don't redirect on the login/token endpoint itself
      if (!url.includes('/token') && !url.includes('/register')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

