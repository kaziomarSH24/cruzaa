/**
 * API Service - Backend Integration
 * Base configuration and axios instance for backend API calls
 */

import axios from "axios";

// Base API URL - Use local if on localhost, otherwise production
const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");
// export const API_BASE_URL = isLocal ? 'http://localhost/backend' : 'https://cruzaa.com/backend';
// export const API_BASE_URL = isLocal ? 'https://api-cruzaa.kaziomar.me/backend' : 'https://api-cruzaa.kaziomar.me/backend';
// export const API_BASE_URL = isLocal
//   ? "http://localhost:8000/backend"
//   : "https://www.cruzaa.com/backend";
export const API_BASE_URL = isLocal
  ? "https://c-api.kaziomar.me/"
  : "https://c-api.kaziomar.me/";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      //for bypass nginx header
      config.headers["X-Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  },
);

// Helper function for form data requests (file uploads)
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value instanceof FileList) {
      Array.from(value).forEach((file) => {
        formData.append(`${key}[]`, file);
      });
    } else if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  return formData;
};

export default api;
