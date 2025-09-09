"use client";

import React, { useState } from 'react';
import { ArrowRight, Mail, Loader2 } from 'lucide-react';
import { redirect, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAppContext, user_service } from '@/context/appContext';
import Loading from "@/components/Loading";
import toast from 'react-hot-toast';

// --------------------- LOGIN PAGE COMPONENT ---------------------
const LoginPage = () => {
    // --------------------- LOCAL STATE ---------------------
    const [email, setEmail] = useState<string>("");      // Input field
    const [loading, setLoading] = useState<boolean>(false); // Local loading flag for form submission
    const router = useRouter();                           // Next.js router for navigation

    // --------------------- GLOBAL CONTEXT ---------------------
    const { isAuth, loading: userLoading } = useAppContext(); // Access auth & loading state globally

    // --------------------- FORM SUBMISSION ---------------------
    const handleSubmit = async (e: React.FormEvent<HTMLElement>): Promise<void> => {
        e.preventDefault();       // Prevent page reload
        setLoading(true);         // Show local loader

        try {
            // Make POST request to backend login route
            const { data } = await axios.post(`${user_service}/api/v1/login`, { email });
            
            toast.success(data.message); // Show success message
            router.push(`/verify?email=${email}`); // Navigate to OTP verification page
        } catch (error: any) {
            // Handle error response from backend
            toast.error(error.response?.data?.error || "Something went wrong");
        } finally {
            setLoading(false); // Stop local loader regardless of success/failure
        }
    };

    // --------------------- REDIRECT LOGIC ---------------------
    // If user data is still loading from context, show loading spinner
    if (userLoading) return <Loading />;
 
    // If user is already authenticated, redirect to chat page
    if (isAuth) return redirect("/chat");

    // --------------------- JSX ---------------------
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                    
                    {/* HEADER */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 shadow-md">
                            <Mail size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-3">
                            Sign in to MoodVibe
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Enter your email to begin.
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2 ml-1"
                            >
                                Enter your email to get started.
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition placeholder-gray-400 text-gray-900"
                            />
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? (
                                <div className='flex items-center justify-center gap-2'>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Sending OTP to your email...
                                </div>
                            ) : (
                                <div className='flex items-center justify-center gap-2'>
                                    <span>Send verification code</span>
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
