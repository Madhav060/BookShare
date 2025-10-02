// src/utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Store token in memory (will be set by AuthContext)
let sessionToken: string | null = null;

export function setAuthToken(token: string | null) {
  sessionToken = token;
}

// Add auth header to all requests
api.interceptors.request.use((config) => {
  if (sessionToken) {
    config.headers['x-session-token'] = sessionToken;
  }
  return config;
});

export default api;
