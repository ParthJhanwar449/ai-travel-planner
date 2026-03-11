import { api } from "@/lib/api";

export const userService = {
    getMe: async () => {
        const response = await api.get("/users/me");
        return response.data;
    },
    updatePreferences: async (preferences: any) => {
        const response = await api.put("/users/me/preferences", preferences);
        return response.data;
    },
};