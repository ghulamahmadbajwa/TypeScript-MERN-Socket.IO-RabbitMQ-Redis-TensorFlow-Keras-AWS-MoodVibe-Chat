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
        <div className="min-h-screen bg-[#F5E6D3] flex items-center justify-center p-4" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}>
            <div className="max-w-md w-full">
                <div className="bg-[#F5E6D3]/80 border border-[#A67B5B] rounded-2xl p-8 shadow-lg backdrop-blur-sm">
                    
                    {/* HEADER */}
                    <div className="text-center mb-8 bg">
                        <div className="mx-auto w-20 h-20 bg-[#6B4E2E] rounded-xl flex items-center justify-center mb-6 shadow-md">
                            <Mail size={40} className="text-[#F5E6D3]" />
                        </div>
                        <h1 className="text-3xl font-merriweather font-bold text-[#2D2D2D] mb-3">
                            Welcome to Ping
                        </h1>
                        <p className="text-[#2D2D2D] text-lg font-merriweather">
                            Connect instantly, chat effortlessly.
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-merriweather text-[#2D2D2D] mb-2 ml-1"
                            >
                                Enter your email to start chatting ✨
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="e.g. you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-[#A67B5B] bg-[#C9B79C] focus:ring-2 focus:ring-[#6B4E2E] focus:border-[#6B4E2E] outline-none transition placeholder-[#2D2D2D] text-[#2D2D2D] font-merriweather"
                            />
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            className="w-full bg-[#6B4E2E] text-[#F5E6D3] py-3 px-4 rounded-lg font-merriweather flex items-center justify-center gap-2 hover:bg-[#A67B5B] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? (
                                <div className='flex items-center justify-center gap-2'>
                                    <Loader2 className="h-5 w-5 animate-spin text-[#F5E6D3]" />
                                    Sending your access link...
                                </div>
                            ) : (
                                <div className='flex items-center justify-center gap-2'>
                                    <span>Join the conversation</span>
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