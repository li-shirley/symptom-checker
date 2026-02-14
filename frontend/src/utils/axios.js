import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "";

const api = axios.create({
    baseURL,
    withCredentials: true, // sends httpOnly refresh cookie
    timeout: 10000,
});

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    console.error("Missing VITE_API_URL in production build.");
}

export default api;
