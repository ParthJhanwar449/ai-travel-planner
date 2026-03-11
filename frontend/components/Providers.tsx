"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
            {children}
        </GoogleOAuthProvider>
    );
}