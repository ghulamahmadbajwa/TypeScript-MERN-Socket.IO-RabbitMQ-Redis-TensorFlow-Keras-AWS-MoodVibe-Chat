import { User } from '@/context/appContext';
import {
  CornerDownRight,
  CornerUpLeft,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  UserCircle,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';

// Props expected by ChatSidebar
interface ChatSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showAllUsers: boolean;
  setShowAllUsers: (show: boolean | ((prev: boolean) => boolean)) => void;
  users: User[] | null;
  loggedInUser: User | null;
  chats: any[] | null;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  handlelogout: () => void;
  createChat: (user: User) => void;
  onlineUsers: string[];
}

const ChatSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  showAllUsers,
  setShowAllUsers,
  users,
  loggedInUser,
  chats,
  selectedUser,
  setSelectedUser,
  handlelogout,
  createChat,
  onlineUsers
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState(''); // Local state to filter users in "New Chat"

  // =========================
  // Sidebar Component
  // =========================
  return (
    <aside
      className={`fixed z-10 sm:static top-0 left-0 h-screen w-80 bg-gray-900 border-r border-gray-700 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0
        transition-transform duration-300 flex flex-col`}
    >
      {/* =========================
          Header Section
      ========================= */}
      <div className="p-6 border-b border-gray-700">
        {/* Mobile-only close button */}
        <div className="sm:hidden flex justify-end">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Sidebar title + toggle button */}
        <div className="flex items-center justify-between">
          {/* Title + Icon */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {showAllUsers ? 'New Chat' : 'Messages'}
            </h2>
          </div>

          {/* Toggle between "All Users" and "Chats" */}
          <button
            onClick={() => setShowAllUsers((prev) => !prev)}
            className={`p-2.5 rounded-lg transition-colors 
              ${showAllUsers ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {showAllUsers ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* =========================
          Main Content Section
      ========================= */}
      <div className="flex-1 overflow-hidden px-4 py-2">

        {/* ---------- CASE 1: Show all users for new chat ---------- */}
        {showAllUsers ? (
          <div className="space-y-4 w-full">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Users..."
                className="w-full pl-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* List of users */}
            <div className="space-y-2 overflow-y-auto h-full pb-4">
              {users
                ?.filter(
                  (u) =>
                    u._id !== loggedInUser?._id && // Exclude current user
                    u.username.toLowerCase().includes(searchQuery.toLowerCase()) // Search filter
                )
                .map((u) => (
                  <button
                    key={u._id}
                    onClick={() => {
                      setSidebarOpen(false); // Close sidebar (mobile)
                      createChat(u); // Start new chat
                    }}
                    className="w-full text-left rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-colors p-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar container with relative positioning */}
                      <div className="relative">
                        <UserCircle className="w-6 h-6 text-gray-300" />
                        {onlineUsers.includes(u._id) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900"></span>
                        )}
                      </div>

                      {/* Username */}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-white">{u.username}</span>
                      </div>
                      {
                        onlineUsers.includes(u._id) ? "Online" : "Offline"
                      }
                    </div>
                  </button>
                ))}
            </div>
          </div>

        ) : (

          /* ---------- CASE 2: Show chat list ---------- */
          chats && chats.length > 0 ? (
            <div className="space-y-2 overflow-y-auto h-full pb-4">
              {chats.map((chat) => {
                const latestMessage = chat.chat.latestMessage;
                console.log(latestMessage)
                const isSelected = selectedUser === chat.chat._id; // Highlight currently selected chat
                const isSentByMe = latestMessage?.sender === loggedInUser?._id; // Direction arrow
                const unseenCount = chat.chat.unseenCount || 0; // Unread messages

                return (
                  <button
                    key={chat.chat._id}
                    onClick={() => {
                      setSelectedUser(chat.chat._id);
                      setSidebarOpen(false); // Close sidebar on mobile
                    }}
                    className={`w-full text-left p-4 rounded-lg transition-colors
                      ${isSelected
                        ? 'bg-blue-600 border border-blue-500'
                        : 'border border-gray-700 hover:border-gray-600 hover:bg-gray-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar placeholder */}
                      <div className="relative w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                        <UserCircle className="w-7 h-7 text-gray-300" />

                        {/* Online indicator */}
                        {onlineUsers.includes(chat.user._id) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900"></span>
                        )}
                      </div>
                      {/* Chat info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {chat.user.username}
                          </span>
                          {/* Unseen messages badge */}
                          {unseenCount > 0 && (
                            <div className="bg-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-5.5 flex items-center justify-center px-2">
                              {unseenCount > 99 ? '99+' : unseenCount}
                            </div>
                          )}
                        </div>
                        {/* Latest message preview with arrow */}
                        {latestMessage && (
                          <div className="flex items-center gap-2">
                            {isSentByMe ? (
                              <CornerUpLeft size={14} className="text-blue-400 flex-shrink-0" />
                            ) : (
                              <CornerDownRight size={14} className="text-green-400 flex-shrink-0" />
                            )}
                            <span className="text-sm text-gray-400 truncate">{latestMessage.text}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          ) : (

            /* ---------- CASE 3: Empty chat state ---------- */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 bg-gray-400 rounded-full mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400">No conversation yet</p>
              <p className="text-sm text-gray-500 mt-1">Start a new chat to begin messaging</p>
            </div>
          )
        )}
      </div>

      {/* =========================
          Footer Section
      ========================= */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {/* Profile link */}
        <Link
          href={'/profile'}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <div className="p-1.5 bg-gray-700 rounded-lg">
            <UserCircle className="w-4 h-4 text-gray-300" />
          </div>
          <span className="font-medium text-gray-300">Profile</span>
        </Link>

        {/* Logout button */}
        <button
          onClick={handlelogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-red-600 hover:text-white"
        >
          <div className="p-1.5 bg-gray-700 rounded-lg">
            <LogOut className="w-4 h-4 text-gray-300" />
          </div>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default ChatSidebar;

/* =========================
Conceptual Summary
==========================
1. Mobile vs Desktop:
   - `sidebarOpen` controls sidebar visibility for small screens.
   - Desktop sidebar always visible.

2. showAllUsers:
   - Toggles between creating new chat or viewing chat list.

3. searchQuery:
   - Used to filter users dynamically while typing in "New Chat".

4. chats:
   - Shows latest message, unseen count, highlights selected chat.
   - Uses arrows to indicate sender direction (me vs other user).

5. Footer:
   - Quick access to profile and logout functionality.

6. React Notes:
   - State is never mutated directly.
   - Conditional rendering separates "All Users", "Chats", and "Empty" states for clarity.
   - Buttons use `onClick` callbacks to trigger state changes or API actions.

*/
