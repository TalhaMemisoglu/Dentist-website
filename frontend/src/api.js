import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

// sample JavaScript code snippet
const apiUrl = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : apiUrl,
});


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            if (!refreshToken) {
                throw new Error("No refresh token available");
            }
            const response = await api.post('/api/token/refresh/', {
                refresh: refreshToken
            });

            const { access } = response.data;
            localStorage.setItem(ACCESS_TOKEN, access);
            
            originalRequest.headers.Authorization = `Bearer ${access}`;
            processQueue(null, access);
            
            return api(originalRequest);
        } catch (error) {
            processQueue(error, null);
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            window.location.href = '/login';
            return Promise.reject(error);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;