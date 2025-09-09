"use client" // Marks this component to be rendered on the client side (required for hooks, state, etc.)

import React from "react";
import { Loader2 } from "lucide-react"; // Import a spinner icon from lucide-react

const Loading = () => {
    return (
        // Full-screen overlay container
        <div 
          className="fixed inset-0 flex items-center justify-center bg-indigo-500 bg-opacity-80 z-50"
        >
            {/* Spinner icon */}
            <Loader2 
                className="h-10 w-10 text-white animate-spin" 
                aria-label="Loading..." // Accessibility: screen readers can identify this as a loading spinner
            />

            {/* 
                Optional custom CSS animation.
                Tailwind's "animate-spin" already provides rotation animation,
                but you can customize speed/direction here if needed.
            */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Loading;

/*
Conceptual Summary:
1. "fixed inset-0": positions the div to cover the entire screen.
2. "flex items-center justify-center": centers the spinner both vertically and horizontally.
3. "bg-indigo-500 bg-opacity-80": semi-transparent background overlay to obscure content while loading.
4. "z-50": ensures this overlay appears above other elements.
5. Loader2: a React icon used as a spinner. Tailwind's "animate-spin" rotates it continuously.
6. Optional style block: defines custom spin animation (not necessary unless you want custom behavior).
*/
