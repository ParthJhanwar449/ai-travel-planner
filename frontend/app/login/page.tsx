"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { GoogleLogin } from "@react-oauth/google";
import { useFormik } from "formik";
import * as Yup from "yup";

// Validation Schema
const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
});

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: loginSchema,
        onSubmit: async (values) => {
            try {
                setIsLoading(true);
                setErrorMsg("");

                // 🔹 Login (token stored inside authService)
                const response = await authService.login(values);

                if (response.access_token && response.user) {
                    // 🔹 Store full user data from response
                    localStorage.setItem("user", JSON.stringify(response.user));

                    // Always redirect to dashboard from main login
                    router.push("/dashboard");
                } else {
                    throw new Error("Login failed: no access token");
                }

            } catch (error) {
                setErrorMsg("Invalid email or password");
                console.error("Login Error:", error);
            } finally {
                setIsLoading(false);
            }
        },
    });

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setIsLoading(true);

            if (credentialResponse.credential) {
                // 🔹 Google login (token stored inside service)
                const response = await authService.googleLogin(
                    credentialResponse.credential
                );

                if (response.access_token && response.user) {
                    // 🔹 Store full user from response
                    localStorage.setItem("user", JSON.stringify(response.user));

                    // Always redirect to dashboard
                    router.push("/dashboard");
                }
            }
        } catch (error) {
            console.error("Google Login failed", error);
            alert("Google login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] relative flex items-center justify-center bg-[#040905] overflow-hidden p-6">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full" />

            <div className="relative w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">
                        Traveler Access
                    </h1>
                    <p className="text-white/60">
                        Identify yourself to enter your vault.
                    </p>
                </header>

                <form onSubmit={formik.handleSubmit} className="space-y-5">

                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-emerald-400 mb-2">
                            Traveler Identity (Email)
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="traveler@voyage.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-emerald-500/50"
                            {...formik.getFieldProps("email")}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    document.getElementById("password")?.focus();
                                }
                            }}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="text-red-400 text-xs mt-1 ml-1">
                                {formik.errors.email}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-semibold text-emerald-400 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-emerald-500/50 pr-12"
                                {...formik.getFieldProps("password")}
                            />
                            {formik.values.password && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            )}
                        </div>
                        {formik.touched.password && formik.errors.password && (
                            <div className="text-red-400 text-xs mt-1 ml-1">
                                {formik.errors.password}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="font-bold text-amber-500 hover:text-amber-400 transition-colors"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all duration-300 uppercase tracking-widest"
                    >
                        {isLoading ? "Navigating..." : "Sign In"}
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#040905] px-2 text-white/40 font-bold tracking-widest">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="bg-white rounded-lg p-0.5">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() =>
                                    console.log("Login Failed")
                                }
                                theme="filled_blue"
                                shape="rectangular"
                            />
                        </div>
                    </div>

                    <p className="text-center text-sm text-white/60">
                        New here?{" "}
                        <Link
                            href="/register"
                            className="text-amber-500 font-bold hover:text-amber-400 transition-colors"
                        >
                            Join the travelers
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
