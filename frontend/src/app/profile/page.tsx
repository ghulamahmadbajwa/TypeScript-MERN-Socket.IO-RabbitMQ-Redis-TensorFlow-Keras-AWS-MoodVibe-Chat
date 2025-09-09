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

    const editHandler = () => {
        setIsEdit(true);
        setName(user?.username ?? "");
    };

    const cancelHandler = () => {
        setIsEdit(false);
        setName("");
    };

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

    useEffect(() => {
        if (!isAuth && !loading) {
            router.push("/login");
        }
    }, [isAuth, router, loading]);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white">
            {/* Header */}
            <div className="max-w-3xl mx-auto flex items-center gap-4 mb-12">
                <button
                    onClick={() => router.push("/chat")}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-300" />
                </button>
                <h1 className="text-3xl font-bold tracking-tight">Account</h1>
            </div>

            {/* Profile Card */}
            <div className="max-w-3xl mx-auto bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                {/* Top section */}
                <div className="bg-gray-700/60 p-8 flex items-center gap-6">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full bg-gray-600 flex items-center justify-center shadow-inner">
                            <UserCircle className="w-16 h-16 text-gray-300" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 shadow"></div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-1">
                            {user?.username || "User"}
                        </h2>
                    </div>
                    {!isEdit && (
                        <button
                            onClick={editHandler}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
                        >
                            <Pencil className="w-4 h-4" /> Edit
                        </button>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-6">
                    {!isEdit ? (
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <p className="text-gray-400 text-xs uppercase tracking-wide">
                                Username
                            </p>
                            <p className="text-lg font-semibold mt-1">
                                {user?.username || "N/A"}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition"
                                >
                                    <Save className="w-4 h-4" /> Save
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelHandler}
                                    className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition"
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
