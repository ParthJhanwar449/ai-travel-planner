"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function RegisterPage() {
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("Invalid email address")
                .required("Email is required"),
            password: Yup.string()
                .min(6, "Password must be at least 6 characters")
                .required("Password is required"),
        }),
        onSubmit: async (values) => {
            try {
                setErrorMsg("");
                await authService.register(values);
                router.push("/login");
            } catch (error) {
                setErrorMsg("Registration failed. Email might already be in use.");
                console.error(error);
            }
        },
    });

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#040905] overflow-hidden p-6">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full" />

            <div className="relative w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">
                        Traveler Birth
                    </h1>
                    <p className="text-white/60 text-lg">
                        Define your identity and master the journey.
                    </p>
                </header>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-bold">
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-emerald-400 mb-2">Voyager Identity (Email)</label>
                        <input
                            type="email"
                            placeholder="traveler@voyage.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-white/20 transition-all outline-none focus:border-emerald-500/50 focus:bg-white/10"
                            {...formik.getFieldProps("email")}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="text-red-400 text-xs mt-2 ml-1 font-bold">
                                {formik.errors.email}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-emerald-400 mb-2">Secure Key (Password)</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-white/20 transition-all outline-none focus:border-emerald-500/50 focus:bg-white/10 font-mono pr-12"
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
                            <div className="text-red-400 text-xs mt-2 ml-1 font-bold">
                                {formik.errors.password}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/40 border border-emerald-400/20 uppercase tracking-widest"
                    >
                        {formik.isSubmitting ? "Initiating..." : "Start Adventure"}
                    </button>

                    <p className="text-center text-xs text-white/40 pt-2 font-bold uppercase tracking-widest">
                        Already a voyager?{" "}
                        <Link
                            href="/login"
                            className="text-amber-500 hover:text-amber-400 transition-colors font-black"
                        >
                            Return to port
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}