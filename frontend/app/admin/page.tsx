"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AdminLoginPage() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const res = await api.post("/auth/login", {
                email,
                password
            });

            const user = res.data.user;

            if (!user?.is_admin) {
                setError("You are not authorized to access the admin panel.");
                return;
            }

            // Save admin token
            localStorage.setItem("access_token", res.data.access_token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            router.push("/admin/dashboard");

        } catch (err: any) {

            console.error(err);

            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Admin login failed.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#040905] text-white">

            <form
                onSubmit={handleLogin}
                className="bg-white/5 p-10 rounded-2xl w-[420px] space-y-6 border border-white/10"
            >

                <h1 className="text-2xl font-bold text-center">
                    Admin Login
                </h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded">
                        {error}
                    </div>
                )}

                <input
                    type="email"
                    placeholder="Admin Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded bg-black/30 border border-white/10 focus:outline-none focus:border-purple-500"
                />

                <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded bg-black/30 border border-white/10 focus:outline-none focus:border-purple-500"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-500 p-3 rounded font-bold transition disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

            </form>

        </div>
    );
}
