import axios from "axios";

const api = axios.create({
  // Automatically picks the right URL based on where it's running
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export default api;
