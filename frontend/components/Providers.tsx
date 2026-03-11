"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <GoogleOAuthProvider clientId="335608642228-asorcgqngtvo8tvn7oma4m15cckh4ov3.apps.googleusercontent.com">
            {children}
        </GoogleOAuthProvider>
    );
}