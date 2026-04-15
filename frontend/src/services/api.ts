import axios from "axios";
import { authStore } from "../store/auth-store";

// For separate deployment: use VITE_API_URL environment variable
// For local development: use localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const unwrap = <T,>(promise: Promise<{ data: T }>) => promise.then((response) => response.data);
