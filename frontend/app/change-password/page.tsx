"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { api } from "@/lib/api";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const formik = useFormik({
        initialValues: {
            old_password: "",
            new_password: "",
            confirm_password: "",
        },
        validationSchema: Yup.object({
            old_password: Yup.string().required("Old password is required"),
            new_password: Yup.string()
                .min(6, "Minimum 6 characters")
                .required("New password is required"),
            confirm_password: Yup.string()
                .oneOf([Yup.ref("new_password")], "Passwords must match")
                .required("Confirm your new password"),
        }),
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                await api.put("/users/me/password", {
                    old_password: values.old_password,
                    new_password: values.new_password,
                });

                alert("Password updated successfully!");
                router.push("/profile");
            } catch (error: any) {
                if (error.response?.data?.detail) {
                    setErrors({ old_password: error.response.data.detail });
                } else {
                    alert("Something went wrong.");
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="min-h-screen bg-[#040905] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full" />
            <form
                onSubmit={formik.handleSubmit}
                className="relative bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-3xl p-10 w-full max-w-md text-white"
            >
                <h1 className="text-2xl font-black mb-8 text-center text-emerald-400 tracking-tight uppercase">
                    Security Update
                </h1>

                {/* Old Password */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type={showOld ? "text" : "password"}
                            name="old_password"
                            placeholder="Current Password"
                            onChange={formik.handleChange}
                            value={formik.values.old_password}
                            className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white placeholder:text-white/20 pr-12"
                        />
                        {formik.values.old_password && (
                            <button
                                type="button"
                                onClick={() => setShowOld(!showOld)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                                {showOld ? (
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
                    {formik.errors.old_password && (
                        <p className="text-red-400 text-sm mt-1">
                            {formik.errors.old_password}
                        </p>
                    )}
                </div>

                {/* New Password */}
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type={showNew ? "text" : "password"}
                            name="new_password"
                            placeholder="New Password"
                            onChange={formik.handleChange}
                            value={formik.values.new_password}
                            className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white placeholder:text-white/20 pr-12"
                        />
                        {formik.values.new_password && (
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                                {showNew ? (
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
                    {formik.errors.new_password && (
                        <p className="text-red-400 text-sm mt-1">
                            {formik.errors.new_password}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type={showConfirm ? "text" : "password"}
                            name="confirm_password"
                            placeholder="Confirm New Password"
                            onChange={formik.handleChange}
                            value={formik.values.confirm_password}
                            className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-white placeholder:text-white/20 pr-12"
                        />
                        {formik.values.confirm_password && (
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                                {showConfirm ? (
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
                    {formik.errors.confirm_password && (
                        <p className="text-red-400 text-sm mt-1">
                            {formik.errors.confirm_password}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold transition-all mb-4 shadow-lg shadow-emerald-900/40 border border-emerald-400/20"
                >
                    {formik.isSubmitting ? "Updating Password..." : "Update Password"}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/profile")}
                    className="w-full text-white/50 hover:text-white text-sm transition"
                >
                    Back to Profile
                </button>
            </form>
        </div>
    );
}
