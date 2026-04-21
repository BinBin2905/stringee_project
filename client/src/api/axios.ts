import axios, { type AxiosInstance } from "axios";
import { storage } from "@/utils/storage";

const backendApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_DEMO_PROJECT_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the active tab's token
backendApi.interceptors.request.use((config) => {
  const saved = storage.getActive();
  if (saved?.token) {
    config.headers["X-STRINGEE-AUTH"] = saved.token;
  }
  return config;
});

// On 401, drop the active user's token
backendApi.interceptors.response.use(
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

export default backendApi;
