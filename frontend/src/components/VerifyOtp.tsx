"use client" // Marks this as a client-side component in Next.js (needed for hooks like useState, useEffect)

import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight, Loader2, Lock, ChevronLeft } from 'lucide-react'
import { redirect, useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useAppContext, user_service } from '@/context/appContext'
import Loading from "@/components/Loading";
import toast from 'react-hot-toast'

const VerifyOtp = () => {
  // ------------- Context & App State -------------
  const { isAuth, setIsAuth, setUser, loading: userLoading, fetchChats, fetchUsers } = useAppContext();

  // ------------- Local Component State -------------
  const [loading, setLoading] = useState<boolean>(false);           // Show spinner while verifying OTP
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']); // Store each digit of the 6-digit OTP
  const [error, setError] = useState<string>("");                  // Show validation/error messages
  const [resendLoading, setResendLoading] = useState<boolean>(false); // Loading state for resend OTP
  const [timer, setTimer] = useState(60);                          // Countdown timer for resending OTP

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);    // Refs to all OTP input fields
  const router = useRouter();

  const searchParams = useSearchParams()
  const email: string = searchParams.get("email") || "";           // Get email from URL query params

  // ------------- Timer Effect for Resend Button -------------
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1); // Decrease timer every second
      }, 1000);
      return () => clearInterval(interval); // Cleanup interval when component unmounts or timer changes
    }
  }, [timer]);

  // ------------- Handle OTP Form Submission -------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload on form submit

    const enteredOtp = otp.join(""); // Join the 6 digits into a single string
    if (enteredOtp.length < 6) {
      setError("Please enter the 6 digit code");
      return;
    }

    setError(""); // Clear previous errors
    setLoading(true); // Start spinner

    try {
      // Call backend API to verify OTP
      const { data } = await axios.post(`${user_service}/api/v1/verify`, { email, otp: enteredOtp });

      toast.success(data.message);

      // Store JWT token in cookies
      Cookies.set("token", data.token, {
        expires: 15, // Expiry in days
        secure: false, // Only send cookie over HTTPS (set true for production)
        path: '/', // Accessible on all paths
      });
      console.log("Cookie set!", Cookies.get("token"));

      // Clear OTP input fields and focus first input
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      // Update global app state
      setUser(data.user);
      setIsAuth(true);
      fetchChats(); // Fetch user chats after login
      fetchUsers(); // Fetch all users
    } catch (error) {
      setError((error as any).response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ------------- Resend OTP Handler -------------
  const handleResendOtp = async () => {
    setResendLoading(true);
    setError(""); // Clear previous error

    try {
      const { data } = await axios.post(`${user_service}/api/v1/login`, { email });
      toast.success(data.message);
      setTimer(60); // Reset resend timer
    } catch (error) {
      setError((error as any).response?.data?.message || "Something went wrong");
    } finally {
      setResendLoading(false);
    }
  };

  // ------------- OTP Input Change Handler -------------
  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return; // Prevent pasting more than 1 character in each box

    const newOtp = [...otp];      // Create a new array to avoid mutating state directly
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  // ------------- Handle Backspace for OTP Inputs -------------
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLElement>): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus(); // Move cursor to previous input if current is empty
    }
  }

  // ------------- Handle Paste into OTP Inputs -------------
  const handlePaste = (e: React.ClipboardEvent<HTMLElement>): void => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const digits = pasteData.replace(/\D/g, "").slice(0, 6); // Keep only digits, max 6
    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus(); // Focus last input
    }
  }

  // ------------- Redirect if already authenticated -------------
  if (userLoading) return <Loading />; // Show loading screen while app is fetching user data
  if (isAuth) redirect("/chat");       // If user is already logged in, go to chat page

  // ------------------------ JSX Render ------------------------
  return (
    <div className="min-h-screen bg-[#F5E6D3] flex items-center justify-center p-4" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}>
      <div className="max-w-md w-full">
        <div className="bg-[#F5E6D3]/80 border border-[#A67B5B] rounded-2xl p-8 shadow-lg shadow-sm">

          {/* Header Section */}
          <div className="text-center mb-8 relative">
            {/* Back button */}
            <button
              className='absolute top-0 left-0 p-2 text-[#6B4E2E] hover:text-[#A67B5B]'
              onClick={() => router.push("/login")}
            >
              <ChevronLeft className='w-6 h-6' />
            </button>

            {/* Lock Icon */}
            <div className="mx-auto w-20 h-20 bg-[#6B4E2E] rounded-xl flex items-center justify-center mb-6 shadow-md">
              <Lock size={40} className="text-[#F5E6D3]" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-merriweather font-bold text-[#2D2D2D] mb-3">Secure Your Message Lane</h1>
            <p className="text-[#2D2D2D] text-lg font-merriweather">Enter the 6-digit code we sent to</p>
            <p className='text-[#6B4E2E] font-merriweather'>{email}</p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6" >
            <div>
              <label className="block text-sm font-merriweather text-[#2D2D2D] mb-4 ml-1 text-center">
                Enter your 6 digit  key
              </label>

              {/* OTP Inputs */}
              <div className='flex justify-center space-x-3'>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined} // Handle paste only on first input
                    className='w-12 h-12 text-center border border-[#A67B5B] rounded-lg focus:ring-2 focus:ring-[#6B4E2E] focus:border-[#6B4E2E] outline-none text-xl font-merriweather text-[#2D2D2D] placeholder-[#2D2D2D]'
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='bg-[#C9B79C] border border-[#A67B5B] rounded-lg p-3'>
                <p className="text-[#6B4E2E] text-sm text-center font-merriweather">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B4E2E] text-[#F5E6D3] py-3 px-4 rounded-lg font-merriweather flex items-center justify-center gap-2 hover:bg-[#A67B5B] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className='flex items-center justify-center gap-2'>
                  <Loader2 className="h-5 w-5 animate-spin text-[#F5E6D3]" />
                  verifying  key...
                </div>
              ) : (
                <div className='flex items-center justify-center gap-2'>
                  <span>Verify & Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-[#6B4E2E] text-sm mb-4 font-merriweather">Didn’t get your code?</p>
            {timer > 0 ? (
              <p className="text-[#2D2D2D] text-sm font-merriweather">Resend available in {timer}s</p>
            ) : (
              <button
                className="text-[#6B4E2E] hover:text-[#A67B5B] font-merriweather text-sm disabled:opacity-50"
                disabled={resendLoading}
                onClick={handleResendOtp}
              >
                {resendLoading ? "Sending..." : "Resend  Key"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyOtp;

/*
Key Concepts:
1. Never directly mutate state arrays/objects in React. Always create a new copy (e.g., [...otp]) before updating.
2. useRef stores references to DOM elements without causing re-renders.
3. Timer logic uses useEffect with cleanup to avoid memory leaks.
4. Form validation prevents sending incomplete OTP.
5. Cookies store JWT tokens securely and allow persistent login.
6. Auto-focus logic improves UX for OTP input fields.
7. Redirect logic ensures authenticated users don't stay on OTP page.
*/