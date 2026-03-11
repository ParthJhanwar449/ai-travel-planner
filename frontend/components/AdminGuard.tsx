"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({ children }: any) {

    const router = useRouter();

    useEffect(() => {

        const token = localStorage.getItem("admin_token");

        if (!token) {
            router.replace("/admin");
        }

    }, []);

    return children;
}