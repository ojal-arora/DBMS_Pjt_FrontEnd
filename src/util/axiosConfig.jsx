import axios from "axios";
import { BASE_URL } from "./apiEndpoints.js";

const axiosConfig = axios.create({
    baseURL: BASE_URL || import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

// endpoints that do NOT need Authorization
const excludeEndpoints = ["/login", "/register", "/status", "/activate", "/health"];

// Request Interceptor
axiosConfig.interceptors.request.use(
    (config) => {
        const shouldSkipToken = excludeEndpoints.some((endpoint) =>
            config.url?.includes(endpoint)
        );

        if (!shouldSkipToken) {
            const accessToken = localStorage.getItem("token");
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
axiosConfig.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                window.location.href = "/login";
            } else if (error.response.status === 500) {
                console.error("Server error. Please try again later");
            }
        } else if (error.code === "ECONNABORTED") {
            console.error("Request timeout. Please try again.");
        }

        return Promise.reject(error);
    }
);

export default axiosConfig;
