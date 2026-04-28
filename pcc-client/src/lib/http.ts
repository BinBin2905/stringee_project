import axios, { type AxiosInstance } from "axios";
import { storage } from "@/lib/storage";
import { toast } from "@/lib/toast";

export const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_DEMO_PROJECT_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

http.interceptors.request.use((config) => {
  const saved = storage.get();
  if (saved?.token) config.headers["X-STRINGEE-AUTH"] = saved.token;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      storage.clear();
      toast.error("Session expired — please sign in again");
    } else if (!error.response) {
      const url = error.config?.baseURL ?? "server";
      toast.error(`Network error — cannot reach ${url}`);
    }
    return Promise.reject(error);
  },
);
