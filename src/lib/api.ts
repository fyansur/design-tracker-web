import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.config?.suppressGlobalError) {
      const message = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;