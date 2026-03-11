import { api } from "@/lib/api";

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
}

export const authService = {
    login: async (data: LoginData) => {
        const response = await api.post("/auth/login", data);

        if (response.data.access_token) {
            localStorage.setItem("access_token", response.data.access_token);
        }

        return response.data;
    },

    googleLogin: async (token: string) => {
        const response = await api.post("/auth/google-login", { access_token: token });

        if (response.data.access_token) {
            localStorage.setItem("access_token", response.data.access_token);
        }

        return response.data;
    },

    register: async (data: RegisterData) => {
        return await api.post("/auth/register", data);
    },

    logout: () => {
        localStorage.removeItem("access_token");
    },
};
