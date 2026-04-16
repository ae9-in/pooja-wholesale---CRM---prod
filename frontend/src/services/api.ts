import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/+$/, "");

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});

export const unwrap = <T,>(promise: Promise<{ data: T }>) => promise.then((response) => response.data);
