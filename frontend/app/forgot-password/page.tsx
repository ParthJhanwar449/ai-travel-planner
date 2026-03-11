"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";

export default function ForgotPassword() {
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("Invalid email address")
                .required("Email is required"),
        }),
        onSubmit: async (values) => {
            try {
                setMessage("");
                const res = await api.post("/auth/forgot-password", {
                    email: values.email,
                });
                setMessage(res.data.message || "Reset link sent to your email.");
                setIsSuccess(true);
            } catch (err) {
                setMessage("Something went wrong. Please try again.");
                setIsSuccess(false);
            }
        },
    });

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#040905] overflow-hidden p-6">
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full" />

            <div className="relative w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">
                        Lost Access?
                    </h1>
                    <p className="text-white/60">
                        Enter your email to receive a secure recovery link.
                    </p>
                </header>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-emerald-400 mb-2">
                            Traveler Email
                        </label>
                        <input
                            type="email"
                            placeholder="traveler@voyage.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-emerald-500/50 transition-all"
                            {...formik.getFieldProps("email")}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="text-red-400 text-xs mt-2 ml-1 font-bold">
                                {formik.errors.email}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all duration-300 uppercase tracking-widest shadow-lg shadow-emerald-900/20"
                    >
                        {formik.isSubmitting ? "Dispatching..." : "Send Recovery Link"}
                    </button>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm text-center font-bold border ${isSuccess
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}>
                            {message}
                        </div>
                    )}

                    <div className="text-center pt-4 border-t border-white/5">
                        <Link
                            href="/login"
                            className="text-white/40 hover:text-white transition-colors text-sm font-black uppercase tracking-widest"
                        >
                            Return to Entry
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}