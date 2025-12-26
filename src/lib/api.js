import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Your Node Backend URL
  withCredentials: true, // IMPORTANT: Allows cookies (Session ID) to travel
});

export default api;
