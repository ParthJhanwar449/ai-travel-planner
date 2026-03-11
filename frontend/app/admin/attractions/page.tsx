"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Attraction {
    id: number;
    name: string;
    city_id: number;
    city_name: string;
}

export default function AdminAttractionsPage() {

    // Attractions
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [fetching, setFetching] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const limit = 10;

    // Checkbox selection
    const [selectedAttractions, setSelectedAttractions] = useState<number[]>([]);

    // Search Formik
    const searchFormik = useFormik({
        initialValues: {
            search: ""
        },
        onSubmit: (values) => {
            setPage(1);
            fetchAttractions(values.search);
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
                    "/admin/attractions/bulk-upload",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                setUploadResult(response.data);
                fetchAttractions(searchFormik.values.search);

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

    // --------------------------------
    // Fetch Attractions
    // --------------------------------

    const fetchAttractions = async (searchQuery?: string) => {
        try {
            setFetching(true);

            const res = await api.get("/admin/attractions", {
                params: {
                    page,
                    limit,
                    search: searchQuery ?? searchFormik.values.search
                }
            });

            setAttractions(res.data);

        } catch (error) {
            console.error("Error fetching attractions:", error);
        } finally {
            setFetching(false);
        }
    };

    // handleUpload removed, replaced by uploadFormik.handleSubmit

    // --------------------------------
    // Toggle Checkbox
    // --------------------------------

    const toggleAttraction = (id: number) => {

        setSelectedAttractions((prev) =>
            prev.includes(id)
                ? prev.filter((a) => a !== id)
                : [...prev, id]
        );
    };

    // --------------------------------
    // Select All
    // --------------------------------

    const toggleSelectAll = () => {

        if (selectedAttractions.length === attractions.length) {
            setSelectedAttractions([]);
        } else {
            setSelectedAttractions(attractions.map((a) => a.id));
        }
    };

    // --------------------------------
    // Bulk Delete
    // --------------------------------

    const deleteSelected = async () => {

        if (selectedAttractions.length === 0) {
            alert("Select attractions first");
            return;
        }

        const confirmDelete = confirm(
            `Delete ${selectedAttractions.length} attractions?`
        );

        if (!confirmDelete) return;

        try {

            await api.delete("/admin/attractions/bulk-delete", {
                data: {
                    ids: selectedAttractions
                }
            });

            setSelectedAttractions([]);
            fetchAttractions();

        } catch (error) {
            console.error("Bulk delete failed", error);
        }
    };

    useEffect(() => {
        fetchAttractions();
    }, [page]);

    // handleSearch removed, replaced by searchFormik.handleSubmit

    return (
        <div className="text-white">

            <div className="max-w-5xl mx-auto space-y-12">

                {/* ----------------------------- */}
                {/* Bulk Upload */}
                {/* ----------------------------- */}

                <section className="bg-white/5 p-6 rounded-2xl border border-white/10">

                    <h1 className="text-2xl font-bold mb-6">
                        Upload Attractions (CSV / JSON)
                    </h1>

                    <form onSubmit={uploadFormik.handleSubmit} className="space-y-4">

                        <input
                            ref={fileInputRef}
                            name="file"
                            type="file"
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
                            className={`bg-emerald-600 px-6 py-3 rounded font-bold transition-opacity ${uploading ? 'opacity-50' : 'hover:bg-emerald-500'}`}
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Upload File"}
                        </button>

                    </form>

                    {uploadError && <p className="mt-4 text-red-500 font-bold">{uploadError}</p>}

                    {uploadResult && (

                        <div className="mt-6 bg-white/5 p-4 rounded">

                            <p>Inserted: {uploadResult.inserted}</p>
                            <p>Updated: {uploadResult.updated}</p>
                            <p>Failed: {uploadResult.failed}</p>

                        </div>

                    )}

                </section>

                {/* ----------------------------- */}
                {/* Manage Attractions */}
                {/* ----------------------------- */}

                <section>

                    <div className="flex justify-between items-center mb-6">

                        <h2 className="text-2xl font-bold">
                            Manage Attractions
                        </h2>

                        <button
                            onClick={() => fetchAttractions()}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            Refresh
                        </button>

                    </div>

                    {/* Search */}

                    <form
                        onSubmit={searchFormik.handleSubmit}
                        className="flex gap-4 mb-6"
                    >

                        <input
                            type="text"
                            name="search"
                            placeholder="Search attraction..."
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

                    {/* Delete Button */}

                    {selectedAttractions.length > 0 && (

                        <button
                            onClick={deleteSelected}
                            className="mb-4 bg-red-600 px-4 py-2 rounded"
                        >
                            Delete Selected ({selectedAttractions.length})
                        </button>

                    )}

                    {/* Loading */}

                    {fetching ? (

                        <div className="flex justify-center p-12">
                            <div className="animate-spin h-8 w-8 border-b-2 border-amber-500 rounded-full"></div>
                        </div>

                    ) : attractions.length === 0 ? (

                        <div className="text-center p-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p className="text-gray-400">No attractions found.</p>
                        </div>

                    ) : (

                        <div className="space-y-4">

                            {/* Select All */}

                            <div className="flex items-center gap-3 text-sm text-gray-400">

                                <input
                                    type="checkbox"
                                    checked={
                                        selectedAttractions.length === attractions.length
                                    }
                                    onChange={toggleSelectAll}
                                />

                                Select All

                            </div>

                            {attractions.map((attraction) => (

                                <div
                                    key={attraction.id}
                                    className="flex items-center justify-between bg-white/5 p-5 rounded-xl border border-white/10"
                                >

                                    <div className="flex items-center gap-4">

                                        <input
                                            type="checkbox"
                                            checked={selectedAttractions.includes(attraction.id)}
                                            onChange={() =>
                                                toggleAttraction(attraction.id)
                                            }
                                        />

                                        <div>

                                            <h3 className="font-semibold text-lg">
                                                {attraction.name}
                                            </h3>

                                            <p className="text-sm text-gray-400">
                                                City: {attraction.city_name || "Unknown"}
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
