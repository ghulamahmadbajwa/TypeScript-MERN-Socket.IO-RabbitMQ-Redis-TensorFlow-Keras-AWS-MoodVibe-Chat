"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";

import { useAppContext, user_service } from "@/context/appContext";
import Loading from "@/components/Loading";
import { ArrowLeft, UserCircle, Pencil, Save, X } from "lucide-react";

const ProfilePage = () => {
    const { user, isAuth, loading, setUser } = useAppContext();

    const [isEdit, setIsEdit] = useState(false);
    const [name, setName] = useState<string>("");

    const router = useRouter();

    // === Function: editHandler ===
    // Purpose: Enable edit mode and set initial username value
    const editHandler = () => {
        setIsEdit(true);
        setName(user?.username ?? "");
    };

    // === Function: cancelHandler ===
    // Purpose: Cancel edit mode and reset name state
    const cancelHandler = () => {
        setIsEdit(false);
        setName("");
    };

    // === Function: submitHandler ===
    // Purpose: Update username in backend and refresh token
    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("token");

        try {
            const { data } = await axios.post(
                `${user_service}/api/v1/update/user`,
                { name },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            Cookies.set("token", data.token, {
                expires: 15,
                secure: false,
                path: "/",
            });

            toast.success(data.message);
            setUser(data.user);
            setIsEdit(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    // === Effect: Redirect Unauthenticated Users ===
    // Purpose: Redirect to login page if user is not authenticated
    useEffect(() => {
        if (!isAuth && !loading) {
            router.push("/login");
        }
    }, [isAuth, router, loading]);

    if (loading) return <Loading />;

    return (
        // === Page Background ===
        // Purpose: Warm gradient background for chat app profile
        <div className="min-h-screen bg-[#F5E6D3] p-6 text-[#2D2D2D]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}>
            {/* Header */}
            <div className="max-w-3xl mx-auto flex items-center gap-4 mb-12">
                <button
                    onClick={() => router.push("/chat")}
                    className="p-3 bg-[#C9B79C] hover:bg-[#A67B5B] rounded-full border border-[#A67B5B] transition shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5 text-[#6B4E2E]" />
                </button>
            </div>

            {/* Profile Card */}
            <div className="max-w-3xl mx-auto bg-[#F5E6D3]/80 rounded-2xl border border-[#A67B5B] shadow-lg overflow-hidden backdrop-blur-sm">
                {/* Top section */}
                <div className="bg-[#C9B79C] p-8 flex items-center gap-6">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full bg-[#C9B79C] flex items-center justify-center shadow-inner border-2 border-[#A67B5B]">
                            <UserCircle className="w-16 h-16 text-[#6B4E2E]" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#6B4E2E] rounded-full border-2 border-[#F5E6D3] shadow"></div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-merriweather font-bold mb-1 text-[#2D2D2D]">
                            {user?.username || "Ping User"}
                        </h2>
                    </div>
                    {!isEdit && (
                        <button
                            onClick={editHandler}
                            className="flex items-center gap-2 px-4 py-2 bg-[#6B4E2E] hover:bg-[#A67B5B] rounded-lg text-sm font-medium text-[#F5E6D3] transition shadow-sm"
                        >
                            <Pencil className="w-4 h-4" /> Edit
                        </button>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-6">
                    {!isEdit ? (
                        <div className="bg-[#C9B79C] p-4 rounded-lg border border-[#A67B5B]">
                            <p className="text-[#2D2D2D] text-xs uppercase font-merriweather tracking-wide">
                                Username
                            </p>
                            <p className="text-lg font-merriweather font-semibold mt-1 text-[#2D2D2D]">
                                {user?.username || "Unnamed User"}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div>
                                <label className="block text-sm text-[#2D2D2D] font-merriweather mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-[#C9B79C] border border-[#A67B5B] focus:outline-none focus:ring-2 focus:ring-[#6B4E2E] text-[#2D2D2D] font-merriweather"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-5 py-2 bg-[#6B4E2E] hover:bg-[#A67B5B] rounded-lg text-sm font-medium text-[#F5E6D3] transition shadow-sm"
                                >
                                    <Save className="w-4 h-4" /> Save
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelHandler}
                                    className="flex items-center gap-2 px-5 py-2 bg-[#C9B79C] hover:bg-[#A67B5B] rounded-lg text-sm font-medium text-[#2D2D2D] transition shadow-sm"
                                >
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;