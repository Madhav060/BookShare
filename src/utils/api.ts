// src/utils/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Add auth header to all requests
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    config.headers['x-user-id'] = user.id;
  }
  return config;
});

export default api;