import axios from "axios";
import { API_BASE } from "../constants";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send cookies (refresh token) with requests
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export default api;
