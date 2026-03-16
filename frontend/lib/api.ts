import axios from "axios";

export const api = axios.create({
    baseURL: "https://hypernormally-cirrate-toccara.ngrok-free.dev",
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    // Skip ngrok browser warning
    config.headers['ngrok-skip-browser-warning'] = 'true';

    return config;
});