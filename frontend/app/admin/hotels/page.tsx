"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Hotel {
    id: number;
    name: string;
    city_id: string;
    city_name: string;
    price_per_night: number;
    latitude: number;
    longitude: number;
    rating?: number;
}

export default function AdminHotelsPage() {

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [selected, setSelected] = useState<number[]>([]);

    const [page, setPage] = useState(1);
    const limit = 10;

    const [loadingHotels, setLoadingHotels] = useState(false);

    // Search Formik
    const searchFormik = useFormik({
        initialValues: { search: "" },
        onSubmit: (values) => {
            setPage(1);
            fetchHotels(values.search);
        }
    });

    // Upload Formik
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFormik = useFormik({
        initialValues: { file: null as File | null },
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
                    "/admin/hotels/bulk-upload",
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" }
                    }
                );

                setUploadResult(response.data);
                fetchHotels(searchFormik.values.search);

                uploadFormik.resetForm();
                if (fileInputRef.current) fileInputRef.current.value = "";

            } catch (err: any) {
                console.error(err);
                setUploadError(err.response?.data?.detail || "Upload failed");
            } finally {
                setUploading(false);
            }
        }
    });


    const fetchHotels = async (searchQuery?: string) => {
        try {
            setLoadingHotels(true);
            const res = await api.get("/admin/hotels", {
                params: {
                    page,
                    limit,
                    search: searchQuery ?? searchFormik.values.search
                }
            });
            setHotels(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingHotels(false);
        }
    };


    useEffect(() => {
        fetchHotels();
    }, [page]);


    // handleSearch replaced by searchFormik.handleSubmit


    const toggleSelect = (id: number) => {

        if (selected.includes(id)) {
            setSelected(selected.filter(i => i !== id));
        } else {
            setSelected([...selected, id]);
        }

    };


    const selectAll = () => {

        if (selected.length === hotels.length) {
            setSelected([]);
        } else {
            setSelected(hotels.map(h => h.id));
        }

    };


    const deleteSelected = async () => {

        if (selected.length === 0) return;

        const confirmDelete = confirm("Delete selected hotels?");
        if (!confirmDelete) return;

        try {

            await api.delete("/admin/hotels/bulk-delete", {
                data: { ids: selected }
            });

            setSelected([]);

            fetchHotels();

        } catch (err) {
            console.error(err);
        }

    };


    // handleUpload replaced by uploadFormik.handleSubmit


    return (
        <div className="text-white">

            {/* Upload Section */}

            <h1 className="text-2xl font-bold mb-6">
                Upload Hotels (CSV / JSON)
            </h1>

            <form onSubmit={uploadFormik.handleSubmit} className="space-y-6 max-w-md mb-12">

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
                    disabled={uploading}
                    className={`bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded font-bold transition-opacity ${uploading ? 'opacity-50' : ''}`}
                >
                    {uploading ? "Uploading..." : "Upload File"}
                </button>

            </form>

            {uploadError && <p className="mt-4 text-red-500 font-bold mb-4">{uploadError}</p>}


            {/* Upload Result */}

            {uploadResult && (
                <div className="mb-10 bg-white/5 p-4 rounded">

                    <p>Inserted: {uploadResult.inserted}</p>
                    <p>Updated: {uploadResult.updated}</p>
                    <p>Failed: {uploadResult.failed}</p>

                </div>
            )}


            {/* Search */}

            <h2 className="text-xl font-bold mb-4">
                Manage Hotels
            </h2>

            <form onSubmit={searchFormik.handleSubmit} className="flex gap-4 mb-6">

                <input
                    name="search"
                    value={searchFormik.values.search}
                    onChange={searchFormik.handleChange}
                    placeholder="Search hotel..."
                    className="bg-white/10 border border-white/20 px-4 py-2 rounded outline-none focus:border-emerald-500/50"
                />

                <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded font-bold transition-colors"
                >
                    Search
                </button>

                <button
                    type="button"
                    onClick={() => fetchHotels()}
                    className="text-sm text-gray-400 hover:text-white ml-2"
                >
                    Refresh
                </button>

            </form>


            {/* Bulk Delete */}

            <div className="mb-4">

                <label className="flex items-center gap-2">

                    <input
                        type="checkbox"
                        checked={selected.length === hotels.length}
                        onChange={selectAll}
                    />

                    Select All

                </label>

                <button
                    onClick={deleteSelected}
                    className="ml-4 bg-red-600 px-4 py-2 rounded"
                >
                    Delete Selected
                </button>

            </div>


            {/* Hotel List */}

            <div className="space-y-4">

                {hotels.map((hotel) => (

                    <div
                        key={hotel.id}
                        className="bg-white/5 p-5 rounded flex justify-between items-center"
                    >

                        <div className="flex items-center gap-4">

                            <input
                                type="checkbox"
                                checked={selected.includes(hotel.id)}
                                onChange={() => toggleSelect(hotel.id)}
                            />

                            <div>

                                <p className="font-bold">
                                    {hotel.name}
                                </p>

                                <p className="text-sm text-gray-400">
                                    City: {hotel.city_name || "Unknown"}
                                </p>

                                <p className="text-sm text-gray-400">
                                    Price: €{hotel.price_per_night}
                                </p>

                            </div>

                        </div>

                    </div>

                ))}

            </div>


            {/* Pagination */}

            <div className="flex gap-4 mt-10">

                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="bg-gray-700 px-4 py-2 rounded"
                >
                    Prev
                </button>

                <span>Page {page}</span>

                <button
                    onClick={() => setPage(page + 1)}
                    className="bg-gray-700 px-4 py-2 rounded"
                >
                    Next
                </button>

            </div>

        </div>
    );
}
