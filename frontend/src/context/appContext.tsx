'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie"; // Browser cookies (store JWT tokens)
import axios from "axios";       // HTTP client for API requests
import toast, { Toaster } from 'react-hot-toast'; // For showing notifications

// --------------------- API SERVICE URLS ---------------------
export const user_service = "http://localhost:5000";
export const chat_service = "http://localhost:5002";

// --------------------- TYPES ---------------------

// Single user object
export interface User {
    _id: string;
    username: string;
    email: string;
}

// Chat structure (matches backend response)
export interface Chat {
    user: {
        _id: string;
        username: string;
        email: string;
    };
    chat: {
        _id: string;
        users: string[]; // User IDs
        latestMessage: {
            text: string;
            sender: string;
        };
        createdAt: string;
        updatedAt: string;
        unseenCount?: number; // Optional: number of unread messages
    };
}

// Global context state type
interface AppContextType {
    user: User | null;
    loading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    setChats: React.Dispatch<React.SetStateAction<Chat[] | null>>;
    logoutUser: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    fetchChats: () => Promise<void>;
    chats: Chat[] | null;
    users: User[] | null;
}

// --------------------- CREATE CONTEXT ---------------------
const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

// --------------------- PROVIDER COMPONENT ---------------------
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    const [chats, setChats] = useState<Chat[] | null>(null);
    const [users, setUsers] = useState<User[] | null>(null);

    // --------------------- FETCH LOGGED-IN USER ---------------------
    async function fetchUser() {
        try {
            const token = Cookies.get("token"); // JWT token stored in browser cookies
            if (!token) {
                setLoading(false);
                return; // Not logged in
            }

            const { data } = await axios.get(`${user_service}/api/v1/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUser(data);  // Store logged-in user info globally
            setIsAuth(true); // Mark as authenticated
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user:", error);
            setLoading(false);
        }
    }

    // --------------------- LOGOUT USER ---------------------
    async function logoutUser() {
        Cookies.remove("token"); // Remove JWT from browser
        setUser(null);           // Clear user state
        setIsAuth(false);        // Reset auth flag
        toast.success("User logged out");
    }

    // --------------------- FETCH CHATS ---------------------
    async function fetchChats() {
        const token = Cookies.get("token");
        if (!token) return;

        try {
            const { data } = await axios.get(`${chat_service}/api/v1/chats/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("🔍 DEBUG: Fetched chats from backend:", data.chats);
            setChats(data.chats); // Save all chats in global state
        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    }

    // --------------------- FETCH ALL USERS ---------------------
    async function fetchUsers() {
        const token = Cookies.get("token");
        if (!token) return;

        try {
            const { data } = await axios.get(`${user_service}/api/v1/user/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(data); // Store all users globally (for creating new chats)
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    // --------------------- INITIAL LOAD ---------------------
    useEffect(() => {
        fetchUser();  // Check login & fetch user
        fetchChats(); // Fetch chat list
        fetchUsers(); // Fetch all users
    }, []);

    // --------------------- PROVIDER ---------------------
    return (
        <AppContext.Provider value={{
            user,
            setUser,
            isAuth,
            setIsAuth,
            loading,
            logoutUser,
            fetchChats,
            fetchUsers,
            chats,
            users,
            setChats
        }}>
            {children} {/* Render children wrapped inside the provider */}
            <Toaster /> {/* Toast notification system */}
        </AppContext.Provider>
    );
};

// --------------------- CUSTOM HOOK ---------------------
// Easy access to AppContext in components
export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
