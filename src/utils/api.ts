import axios from "axios";

const api = axios.create({
  baseURL: "/api", // relative to Next.js API routes
});

export default api;
