"use client"; // Marks this component to be rendered on the client side (required for hooks, state, etc.)

import Loading from "@/components/Loading";     // Fallback loader while waiting
import VerifyOtp from "@/components/VerifyOtp"; // Main OTP verification component
import { Suspense } from "react";               // React Suspense for lazy loading / fallback

// --------------------- VERIFY PAGE COMPONENT ---------------------
const VerifyPage = () => {
    return (
        // Suspense lets you show a fallback UI while the child component is "loading"
        <Suspense fallback={<Loading />}>
            <VerifyOtp /> {/* OTP verification form */}
        </Suspense>
    );
};

export default VerifyPage;
