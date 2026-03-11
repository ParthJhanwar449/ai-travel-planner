import axios from "axios";

export const api = axios.create({
    baseURL: "http://192.168.8.183:8000",
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});