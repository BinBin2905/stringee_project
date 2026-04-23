import axios, { type AxiosInstance } from "axios";
import { storage } from "@/lib/storage";

// Shared axios — points at the demo project's base URL.
// Adds the active user's token as X-STRINGEE-AUTH and the ngrok-skip header
// so GET requests aren't intercepted by ngrok's abuse interstitial.
export const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_DEMO_PROJECT_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

http.interceptors.request.use((config) => {
  const saved = storage.getActive();
  if (saved?.token) config.headers["X-STRINGEE-AUTH"] = saved.token;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const id = storage.getActiveUserId();
      if (id) storage.remove(id);
      storage.clearActiveUserId();
    }
    return Promise.reject(error);
  },
);
