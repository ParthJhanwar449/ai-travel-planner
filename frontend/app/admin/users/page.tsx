"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";

interface User {
    id: number;
    email: string;
}

export default function AdminUsersPage() {

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Search Formik
    const searchFormik = useFormik({
        initialValues: {
            search: ""
        },
        onSubmit: (values) => {
            fetchUsers(values.search);
        }
    });

    const fetchUsers = async (searchQuery = "") => {
        try {
            setLoading(true);

            const response = await api.get("/admin/users", {
                params: { search: searchQuery }
            });

            setUsers(response.data);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // handleSearch replaced by searchFormik.handleSubmit

    return (
        <div className="text-white">

            <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

            {/* Search */}
            <form onSubmit={searchFormik.handleSubmit} className="mb-6 flex gap-4">
                <input
                    type="text"
                    name="search"
                    placeholder="Search by email..."
                    value={searchFormik.values.search}
                    onChange={searchFormik.handleChange}
                    className="px-4 py-2 rounded bg-white/10 border border-white/20 outline-none focus:border-emerald-500/50"
                />

                <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded font-bold transition-colors"
                >
                    Search
                </button>

                <button
                    type="button"
                    onClick={() => fetchUsers()}
                    className="text-sm text-gray-400 hover:text-white ml-2 underline"
                >
                    Refresh
                </button>
            </form>

            {loading ? (
                <p>Loading users...</p>
            ) : (
                <div className="space-y-4">
                    {users.map((user) => (
                        <Link
                            key={user.id}
                            href={`/admin/users/${user.id}`}
                            className="block bg-white/5 p-4 rounded-lg hover:bg-white/10"
                        >
                            {user.email}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}