"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";

export default function ResetPassword() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token");

    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const formik = useFormik({
        initialValues: {
            password: "",
            confirmPassword: "",
        },
        validationSchema: Yup.object({
            password: Yup.string()
                .min(6, "Password must be at least 6 characters")
                .required("New password is required"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password')], 'Passwords must match')
                .required("Please confirm your password"),
        }),
        onSubmit: async (values) => {
            if (!token) {
                setMessage("Invalid or missing reset token.");
                return;
            }

            try {
                setMessage("");
                const res = await api.post("/auth/reset-password", {
                    token,
                    new_password: values.password
                });

                setMessage(res.data.message || "Password reset successfully.");
                setIsSuccess(true);

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 3000);

            } catch (err) {
                setMessage("Reset failed. The token may be expired.");
                setIsSuccess(false);
            }
        },
    });

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#040905] overflow-hidden p-6">
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />

            <div className="relative w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">
                        Reset Vault
                    </h1>
                    <p className="text-white/60">
                        Secure your identity with a new password.
                    </p>
                </header>

                {!token ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-bold">
                        Error: Reset token is missing. Please use the link from your email.
                    </div>
                ) : (
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-emerald-400 mb-2">
                                New Secret Key (Password)
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-emerald-500/50 transition-all font-mono"
                                {...formik.getFieldProps("password")}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-red-400 text-xs mt-2 ml-1 font-bold">
                                    {formik.errors.password}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-emerald-400 mb-2">
                                Confirm Secret Key
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-emerald-500/50 transition-all font-mono"
                                {...formik.getFieldProps("confirmPassword")}
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <div className="text-red-400 text-xs mt-2 ml-1 font-bold">
                                    {formik.errors.confirmPassword}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={formik.isSubmitting || isSuccess}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all duration-300 uppercase tracking-widest shadow-lg shadow-emerald-900/20"
                        >
                            {formik.isSubmitting ? "Updating Vault..." : isSuccess ? "Vault Updated" : "Reset Password"}
                        </button>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm text-center font-bold border animate-in fade-in slide-in-from-bottom-2 duration-300 ${isSuccess
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                                }`}>
                                {message}
                            </div>
                        )}
                    </form>
                )}

                <div className="text-center pt-8 mt-6 border-t border-white/5">
                    <Link
                        href="/login"
                        className="text-white/40 hover:text-white transition-colors text-sm font-black uppercase tracking-widest"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
