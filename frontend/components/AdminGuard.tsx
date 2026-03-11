"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({ children }: any) {

    const router = useRouter();

    useEffect(() => {

        const token = localStorage.getItem("admin_token");
        
        const isValidToken = (t: string) => t.split('.').length === 3;

        if (!token || !isValidToken(token)) {
            router.replace("/admin");
        }

    }, []);

    return children;
}