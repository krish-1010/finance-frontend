import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000/api", // Your Node Backend URL
  baseURL: "https://finance-backend-ww5g.onrender.com/api", // Your Node Backend URL
  withCredentials: true, // IMPORTANT: Allows cookies (Session ID) to travel
});

export default api;
