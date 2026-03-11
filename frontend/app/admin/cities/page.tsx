"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useFormik } from "formik";
import * as Yup from "yup";

interface City {
    id: string;
    name: string;
    country: string;
    latitude: number;
    longitude: number;
}

export default function AdminCitiesPage() {

    // Cities
    const [cities, setCities] = useState<City[]>([]);
    const [fetching, setFetching] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const limit = 10;

    // Checkbox selection
    const [selectedCities, setSelectedCities] = useState<string[]>([]);

    // Search Formik
    const searchFormik = useFormik({
        initialValues: {
            search: ""
        },
        onSubmit: (values) => {
            setPage(1);
            fetchCities(values.search);
        }
    });

    // Upload Formik
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFormik = useFormik({
        initialValues: {
            file: null as File | null
        },
        validationSchema: Yup.object({
            file: Yup.mixed().required("Please select a file")
        }),
        onSubmit: async (values) => {
            if (!values.file) return;

            const formData = new FormData();
            formData.append("file", values.file);

            try {
                setUploading(true);
                setUploadError(null);
                setUploadResult(null);

                const response = await api.post(
                    "/admin/cities/bulk-upload",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                setUploadResult(response.data);
                fetchCities(searchFormik.values.search);

                // Success! Reset
                uploadFormik.resetForm();
                if (fileInputRef.current) fileInputRef.current.value = "";

            } catch (error) {
                console.error(error);
                setUploadError("Upload failed");
            } finally {
                setUploading(false);
            }
        }
    });

    // ----------------------------------------
    // Fetch Cities
    // ----------------------------------------
    const fetchCities = async (searchQuery?: string) => {
        try {
            setFetching(true);

            const res = await api.get("/admin/cities", {
                params: {
                    page,
                    limit,
                    search: searchQuery ?? searchFormik.values.search
                }
            });

            setCities(res.data);

        } catch (error) {
            console.error("Error fetching cities:", error);
        } finally {
            setFetching(false);
        }
    };

    // handleUpload removed, replaced by uploadFormik.handleSubmit

    // ----------------------------------------
    // Toggle Checkbox
    // ----------------------------------------
    const toggleCity = (id: string) => {
        setSelectedCities((prev) =>
            prev.includes(id)
                ? prev.filter((c) => c !== id)
                : [...prev, id]
        );
    };

    // ----------------------------------------
    // Select All
    // ----------------------------------------
    const toggleSelectAll = () => {
        if (selectedCities.length === cities.length) {
            setSelectedCities([]);
        } else {
            setSelectedCities(cities.map((c) => c.id));
        }
    };

    // ----------------------------------------
    // Bulk Delete
    // ----------------------------------------
    const deleteSelected = async () => {

        if (selectedCities.length === 0) {
            alert("Select cities first");
            return;
        }

        const confirmDelete = confirm(
            `Delete ${selectedCities.length} cities?`
        );

        if (!confirmDelete) return;

        try {
            await api.delete("/admin/cities/bulk-delete", {
                data: { ids: selectedCities }
            });

            setSelectedCities([]);
            fetchCities();

        } catch (error) {
            console.error("Bulk delete failed", error);
        }
    };

    useEffect(() => {
        fetchCities();
    }, [page]);

    // handleSearch removed, replaced by searchFormik.handleSubmit

    return (
        <div className="text-white">

            <div className="max-w-5xl mx-auto space-y-12">

                {/* -------------------------------- */}
                {/* BULK UPLOAD */}
                {/* -------------------------------- */}

                <section className="bg-white/5 p-6 rounded-2xl border border-white/10">

                    <h1 className="text-2xl font-bold mb-6">
                        Bulk Upload Cities
                    </h1>

                    <form onSubmit={uploadFormik.handleSubmit} className="space-y-4 max-w-md">

                        <input
                            ref={fileInputRef}
                            type="file"
                            name="file"
                            accept=".csv,.json"
                            onChange={(e) =>
                                uploadFormik.setFieldValue("file", e.target.files ? e.target.files[0] : null)
                            }
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-emerald-600 file:text-white"
                        />
                        {uploadFormik.errors.file && uploadFormik.touched.file && (
                            <p className="text-red-400 text-xs font-bold">{uploadFormik.errors.file as string}</p>
                        )}

                        <button
                            type="submit"
                            disabled={uploading}
                            className={`bg-emerald-600 px-6 py-2 rounded-lg font-bold transition-opacity ${uploading ? 'opacity-50' : 'hover:bg-emerald-500'}`}
                        >
                            {uploading ? "Uploading..." : "Upload File"}
                        </button>

                    </form>

                    {uploadError && <p className="mt-4 text-red-500 font-bold">{uploadError}</p>}

                    {uploadResult && (
                        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-sm">

                            <p className="text-emerald-400 font-semibold mb-1">
                                Upload Result
                            </p>

                            <p>Inserted: {uploadResult.inserted}</p>
                            <p>Updated: {uploadResult.updated}</p>
                            <p>Failed: {uploadResult.failed}</p>

                        </div>
                    )}

                </section>

                {/* -------------------------------- */}
                {/* MANAGE CITIES */}
                {/* -------------------------------- */}

                <section>

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">

                        <h2 className="text-2xl font-bold">
                            Manage Cities
                        </h2>

                        <button
                            onClick={() => fetchCities()}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            Refresh
                        </button>

                    </div>

                    {/* Search */}
                    <form onSubmit={searchFormik.handleSubmit} className="flex gap-4 mb-6">

                        <input
                            type="text"
                            name="search"
                            placeholder="Search city..."
                            value={searchFormik.values.search}
                            onChange={searchFormik.handleChange}
                            className="bg-white/10 border border-white/20 px-4 py-2 rounded outline-none focus:border-emerald-500/50"
                        />

                        <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded font-bold transition-colors"
                        >
                            Search
                        </button>

                    </form>

                    {/* Bulk Delete Button */}
                    {selectedCities.length > 0 && (

                        <button
                            onClick={deleteSelected}
                            className="mb-4 bg-red-600 px-4 py-2 rounded"
                        >
                            Delete Selected ({selectedCities.length})
                        </button>

                    )}

                    {/* Loading */}
                    {fetching ? (

                        <div className="flex justify-center p-12">
                            <div className="animate-spin h-8 w-8 border-b-2 border-emerald-500 rounded-full"></div>
                        </div>

                    ) : cities.length === 0 ? (

                        <div className="text-center p-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p className="text-gray-400">No cities found.</p>
                        </div>

                    ) : (

                        <div className="space-y-4">

                            {/* Select All */}
                            <div className="flex items-center gap-3 text-sm text-gray-400">

                                <input
                                    type="checkbox"
                                    checked={selectedCities.length === cities.length}
                                    onChange={toggleSelectAll}
                                />

                                Select All

                            </div>

                            {cities.map((city) => (

                                <div
                                    key={city.id}
                                    className="flex items-center justify-between bg-white/5 p-5 rounded-xl border border-white/10"
                                >

                                    <div className="flex items-center gap-4">

                                        <input
                                            type="checkbox"
                                            checked={selectedCities.includes(city.id)}
                                            onChange={() => toggleCity(city.id)}
                                        />

                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {city.name}
                                            </h3>

                                            <p className="text-sm text-gray-400">
                                                {city.country}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                    {/* Pagination */}
                    <div className="flex justify-center gap-4 mt-8">

                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="bg-white/10 px-4 py-2 rounded disabled:opacity-50"
                        >
                            Prev
                        </button>

                        <span className="px-4 py-2">
                            Page {page}
                        </span>

                        <button
                            onClick={() => setPage(page + 1)}
                            className="bg-white/10 px-4 py-2 rounded"
                        >
                            Next
                        </button>

                    </div>

                </section>

            </div>

        </div>
    );
}
