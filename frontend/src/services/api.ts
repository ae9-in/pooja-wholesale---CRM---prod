import axios from "axios";
import { authStore } from "../store/auth-store";

// Use relative URL in production, environment variable in development
const baseURL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? "/api/v1" : "http://localhost:5001/api/v1");

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const unwrap = <T,>(promise: Promise<{ data: T }>) => promise.then((response) => response.data);
