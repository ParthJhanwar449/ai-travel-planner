"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { api } from "@/lib/api";

export default function GenerateTripPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            city: "Paris",
            trip_days: 3,
            activities_per_day: 3,
            trip_month: 6,
        },
        validationSchema: Yup.object({
            city: Yup.string().required("City is required"),
            trip_days: Yup.number().min(1, "Minimum 1 day").max(14, "Maximum 14 days").required("Required"),
            activities_per_day: Yup.number().min(1, "Minimum 1 activity").max(6, "Maximum 6 activities").required("Required"),
            trip_month: Yup.number().min(1, "1 (Jan)").max(12, "12 (Dec)").required("Required"),
        }),
        onSubmit: async (values) => {
            try {
                setIsLoading(true);
                const response = await api.post("/generate-itinerary", values);
                const tripId = response.data.trip_id;
                router.push(`/trips/${tripId}`);
            } catch (error) {
                console.error("Trip generation failed", error);
                alert("Failed to generate trip. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <div className="min-h-[calc(100vh-64px)] relative flex items-center justify-center bg-[#040905] overflow-hidden p-6">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full" />

            <div className="relative w-full max-w-xl bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">
                        Plan Your Journey
                    </h1>
                    <p className="text-white/60">
                        Our AI guide will craft your perfect itinerary.
                    </p>
                </header>

                <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-emerald-400 mb-2">Target Region</label>
                        <select
                            name="city"
                            value={formik.values.city}
                            onChange={formik.handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        >
                            <option value="Paris" className="bg-[#040905]">Paris, France</option>
                            <option value="Lyon" className="bg-[#040905]">Lyon, France</option>
                            <option value="London" className="bg-[#040905]">London, UK</option>
                            <option value="Tokyo" className="bg-[#040905]">Tokyo, Japan</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-emerald-400 mb-2">Trip Duration (Days)</label>
                        <input
                            type="number"
                            name="trip_days"
                            value={formik.values.trip_days}
                            onChange={formik.handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                        />
                        {formik.errors.trip_days && <p className="text-red-400 text-xs ml-1">{formik.errors.trip_days}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-emerald-400 mb-2">Activities Per Day</label>
                        <input
                            type="number"
                            name="activities_per_day"
                            value={formik.values.activities_per_day}
                            onChange={formik.handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                        />
                        {formik.errors.activities_per_day && <p className="text-red-400 text-xs ml-1">{formik.errors.activities_per_day}</p>}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-bold text-emerald-400 mb-2">Seasonality (Month 1-12)</label>
                        <input
                            type="range"
                            name="trip_month"
                            min="1"
                            max="12"
                            value={formik.values.trip_month}
                            onChange={formik.handleChange}
                            className="accent-emerald-500 w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-white/40 px-1 font-bold">
                            <span>Jan</span>
                            <span className="text-emerald-300">Selected: {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][formik.values.trip_month - 1]}</span>
                            <span>Dec</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="md:col-span-2 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-emerald-900/40 border border-emerald-400/20 uppercase tracking-widest"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Itinerary...
                            </span>
                        ) : "Generate Itinerary"}
                    </button>
                </form>
            </div>
        </div>
    );
}