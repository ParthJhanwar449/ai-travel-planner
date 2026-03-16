"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user.service";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Preferences {
    interest_culture: number;
    interest_nature: number;
    interest_food: number;
    interest_entertainment: number;
    budget_level: string;
}

const validationSchema = Yup.object({
    interest_culture: Yup.number().min(0).max(10).required(),
    interest_nature: Yup.number().min(0).max(10).required(),
    interest_food: Yup.number().min(0).max(10).required(),
    interest_entertainment: Yup.number().min(0).max(10).required(),
    budget_level: Yup.string().oneOf(["low", "medium", "high"]).required(),
});

const StarRating = ({ value, onChange, label, error }: { value: number; onChange: (val: number) => void; label: string; error?: string }) => {
    return (
        <div className="flex flex-col gap-2 mb-6 w-full max-w-md">
            <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-white/90">{label}</span>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${error ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                    {value}/10
                </span>
            </div>
            <div className="flex gap-1 justify-between">
                {[...Array(10)].map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onChange(i + 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 ${i < value
                            ? "text-emerald-400 bg-emerald-400/20 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            : "text-white/20 bg-white/5 hover:bg-white/10"
                            }`}
                    >
                        <StarIcon filled={i < value} />
                    </button>
                ))}
            </div>
            {error && <span className="text-red-400 text-xs mt-1">{error}</span>}
        </div>
    );
};

const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

export default function OnboardingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [initialData, setInitialData] = useState<Preferences | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await userService.getMe();
                setInitialData({
                    interest_culture: Math.round((user.interest_culture ?? 0.5) * 10),
                    interest_nature: Math.round((user.interest_nature ?? 0.5) * 10),
                    interest_food: Math.round((user.interest_food ?? 0.5) * 10),
                    interest_entertainment: Math.round((user.interest_entertainment ?? 0.5) * 10),
                    budget_level: user.budget_level?.toLowerCase() || "medium",
                });
            } catch (error) {
                console.error("Failed to fetch user preferences:", error);
            }
        };
        fetchUser();
    }, []);

    const formik = useFormik<Preferences>({
        initialValues: initialData || {
            interest_culture: 5,
            interest_nature: 5,
            interest_food: 5,
            interest_entertainment: 5,
            budget_level: "medium",
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            try {
                setIsLoading(true);
                // Convert 1-10 scale to 0.1-1.0 interest according to database requirements
                const dataToSubmit = {
                    ...values,
                    interest_culture: values.interest_culture / 10,
                    interest_nature: values.interest_nature / 10,
                    interest_food: values.interest_food / 10,
                    interest_entertainment: values.interest_entertainment / 10,
                };

                await userService.updatePreferences(dataToSubmit);
                router.push("/dashboard");
            } catch (error) {
                console.error("Failed to save preferences:", error);
                alert("Failed to save preferences. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <main className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-[#040905] overflow-hidden">
            {/* Aurora Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full" />

            <div className="relative w-full max-w-xl bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        Define Your Travel DNA
                    </h1>
                    <p className="text-white/60 text-lg">
                        Mark your preferences and master your journey.
                    </p>
                </header>

                <form onSubmit={formik.handleSubmit}>
                    <div className="space-y-2">
                        <StarRating
                            label="Art & Culture"
                            value={formik.values.interest_culture}
                            onChange={(val) => formik.setFieldValue("interest_culture", val)}
                            error={formik.touched.interest_culture ? (formik.errors.interest_culture as string) : undefined}
                        />
                        <StarRating
                            label="Nature & Outdoors"
                            value={formik.values.interest_nature}
                            onChange={(val) => formik.setFieldValue("interest_nature", val)}
                            error={formik.touched.interest_nature ? (formik.errors.interest_nature as string) : undefined}
                        />
                        <StarRating
                            label="Gourmet & Local Dining"
                            value={formik.values.interest_food}
                            onChange={(val) => formik.setFieldValue("interest_food", val)}
                            error={formik.touched.interest_food ? (formik.errors.interest_food as string) : undefined}
                        />
                        <StarRating
                            label="Nightlife & Entertainment"
                            value={formik.values.interest_entertainment}
                            onChange={(val) => formik.setFieldValue("interest_entertainment", val)}
                            error={formik.touched.interest_entertainment ? (formik.errors.interest_entertainment as string) : undefined}
                        />
                    </div>

                    <div className="mt-8 mb-10">
                        <label className="block mb-3 text-lg font-bold text-white/90">
                            Explorer Resource Level
                        </label>
                        <div className="flex gap-3">
                            {["low", "medium", "high"].map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => formik.setFieldValue("budget_level", level)}
                                    className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 capitalize font-bold ${formik.values.budget_level === level
                                        ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                        : "bg-white/[0.03] border-white/10 text-white/40 hover:bg-white/[0.06] hover:text-white/60"
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/40 border border-emerald-400/20"
                    >
                        {isLoading ? "Setting Up Profile..." : "Start Your Adventure"}
                    </button>
                </form>
            </div>
        </main>
    );
}