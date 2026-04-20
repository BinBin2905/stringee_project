import axios, { type AxiosInstance } from "axios";

const backendApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_DEMO_PROJECT_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự gắn token vào MỌI request
backendApi.interceptors.request.use((config) => {
  const saved = localStorage.getItem("stringee_token");
  if (saved) {
    const { token } = JSON.parse(saved);
    config.headers["X-STRINGEE-AUTH"] = token;
  }
  return config;
});

// Tự xử lý lỗi cho MỌI response
backendApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("stringee_token");
    }
    return Promise.reject(error);
  },
);

export default backendApi;
