"use client";

import { createContext, useEffect, useState, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { chat_service, useAppContext } from "./appContext";

// 1️⃣ Define the shape of data you’ll provide to children via context
interface SocketContextType {
  socket: Socket | null;       // Either an active socket connection or null if not connected
  onlineUsers: string[];       // Array of online user IDs
}

// 2️⃣ Create a context with a default value
const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
});

// Props type for provider
interface SocketProviderProps {
  children: React.ReactNode;
}

/**
 * ✅ SocketProvider
 * ----------------
 * - Establishes a socket connection only when a user is logged in (`user._id` exists).
 * - Provides the socket instance + online users list to all child components via Context.
 * - Cleans up socket connection on unmount or user change to prevent leaks.
 */
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAppContext();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user?._id) return; // ⛔ Don’t connect if user is not logged in

    // 🔌 Create a socket instance (connects to backend server)
    const socketInstance = io(chat_service, {
      query: { userId: user._id }, // Optionally pass userId for tracking
    });

    setSocket(socketInstance);

    // 👥 Listen for online users list from server
    socketInstance.on("getOnlineUser", (users: string[]) => {
      setOnlineUsers(users);
    });

    // 🔒 Cleanup: disconnect socket when component unmounts or user changes
    return () => {
      socketInstance.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * ✅ SocketData
 * -------------
 * - Custom hook to access socket context easily in components.
 * - Example:
 *   const { socket, onlineUsers } = SocketData();
 */
export const SocketData = () => useContext(SocketContext);
