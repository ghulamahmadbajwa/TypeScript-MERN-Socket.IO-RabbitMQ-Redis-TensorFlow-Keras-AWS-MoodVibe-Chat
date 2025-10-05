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
      className={`fixed z-10 sm:static top-0 left-0 h-screen w-80 bg-[#F5E6D3] border-r border-[#A67B5B] transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0
        transition-transform duration-300 flex flex-col shadow-lg rounded-r-xl`}
      style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}
    >
      {/* =========================
          Header Section
      ========================= */}
      <div className="p-6 border-b border-[#A67B5B] bg-[#F5E6D3]/80 backdrop-blur-sm rounded-tr-xl">
        {/* Mobile-only close button */}
        <div className="sm:hidden flex justify-end mb-2">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-[#C9B79C] rounded-full transition-colors shadow-sm"
          >
            <X className="w-5 h-5 text-[#6B4E2E]" />
          </button>
        </div>

        {/* Sidebar title + toggle button */}
        <div className="flex items-center justify-between">
          {/* Title + Icon */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6B4E2E] rounded-xl shadow-sm">
              <MessageCircle className="w-5 h-5 text-[#F5E6D3]" />
            </div>
            <h2 className="text-xl font-merriweather font-bold text-[#2D2D2D]">
              {showAllUsers ? 'New Chat' : 'Chats'}
            </h2>
          </div>

          {/* Toggle between "All Users" and "Chats" */}
          <button
            onClick={() => setShowAllUsers((prev) => !prev)}
            className={`p-2.5 rounded-full transition-colors shadow-sm
              ${showAllUsers ? 'bg-[#6B4E2E] hover:bg-[#A67B5B] text-[#F5E6D3]' : 'bg-[#6B4E2E] hover:bg-[#A67B5B] text-[#F5E6D3]'}`}
          >
            {showAllUsers ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* =========================
          Main Content Section
      ========================= */}
      <div className="flex-1 overflow-hidden px-4 py-3 bg-[#F5E6D3]">

        {/* ---------- CASE 1: Show all users for new chat ---------- */}
        {showAllUsers ? (
          <div className="space-y-4 w-full">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for friends..."
                className="w-full pl-10 py-3 bg-[#F5E6D3] border border-[#A67B5B] rounded-lg text-[#2D2D2D] placeholder-[#2D2D2D] font-merriweather focus:outline-none focus:ring-2 focus:ring-[#6B4E2E] shadow-sm"
              />
            </div>

            {/* List of users */}
            <div className="space-y-2 overflow-y-auto h-full pb-4 pr-1">
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
                    className="w-full text-left rounded-lg border border-[#A67B5B] hover:border-[#6B4E2E] hover:bg-[#C9B79C] transition-colors p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar container with relative positioning */}
                      <div className="relative">
                        <UserCircle className="w-6 h-6 text-[#2D2D2D]" />
                        {onlineUsers.includes(u._id) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#6B4E2E] border-2 border-[#F5E6D3]"></span>
                        )}
                      </div>

                      {/* Username */}
                      <div className="flex-1 min-w-0">
                        <span className="font-merriweather text-[#2D2D2D] truncate">{u.username}</span>
                      </div>
                      <span className="text-sm font-merriweather text-[#2D2D2D]">
                        {onlineUsers.includes(u._id) ? "Online" : "Offline"}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>

        ) : (

          /* ---------- CASE 2: Show chat list ---------- */
          chats && chats.length > 0 ? (
            <div className="space-y-2 overflow-y-auto h-full pb-4 pr-1">
              {chats.map((chat) => {
                const latestMessage = chat.chat.latestMessage;
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
                    className={`w-full text-left p-4 rounded-lg transition-colors shadow-sm
                      ${isSelected
                        ? 'bg-[#C9B79C] border border-[#6B4E2E]'
                        : 'border border-[#A67B5B] hover:border-[#6B4E2E] hover:bg-[#C9B79C]'}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar placeholder */}
                      <div className="relative w-12 h-12 rounded-full bg-[#C9B79C] flex items-center justify-center border-2 border-[#A67B5B]">
                        <UserCircle className="w-7 h-7 text-[#2D2D2D]" />
                        {/* Online indicator */}
                        {onlineUsers.includes(chat.user._id) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#6B4E2E] border-2 border-[#F5E6D3]"></span>
                        )}
                      </div>
                      {/* Chat info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-merriweather truncate ${isSelected ? 'text-[#2D2D2D]' : 'text-[#2D2D2D]'}`}>
                            {chat.user.username}
                          </span>
                          {/* Unseen messages badge */}
                          {unseenCount > 0 && (
                            <div className="bg-[#6B4E2E] text-[#F5E6D3] text-xs font-bold rounded-full min-w-[22px] h-5 flex items-center justify-center px-2 shadow-sm">
                              {unseenCount > 99 ? '99+' : unseenCount}
                            </div>
                          )}
                        </div>
                        {/* Latest message preview with arrow */}
                        {latestMessage && (
                          <div className="flex items-center gap-2">
                            {isSentByMe ? (
                              <CornerUpLeft size={14} className="text-[#6B4E2E] flex-shrink-0" />
                            ) : (
                              <CornerDownRight size={14} className="text-[#6B4E2E] flex-shrink-0" />
                            )}
                            <span className="text-sm text-[#2D2D2D] font-merriweather truncate">{latestMessage.text}</span>
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
              <div className="p-4 bg-[#C9B79C] rounded-full mb-4 shadow-sm">
                <MessageCircle className="w-8 h-8 text-[#6B4E2E]" />
              </div>
              <p className="text-[#2D2D2D] font-merriweather">No chats yet</p>
              <p className="text-sm text-[#2D2D2D] font-merriweather mt-1">Start a new chat to connect</p>
            </div>
          )
        )}
      </div>

      {/* =========================
          Footer Section
      ========================= */}
      <div className="p-4 border-t border-[#A67B5B] bg-[#F5E6D3]/70 backdrop-blur-sm space-y-2 rounded-br-xl">
        {/* Profile link */}
        <Link
          href={'/profile'}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#C9B79C] transition-colors"
        >
          <div className="p-1.5 bg-[#C9B79C] rounded-lg">
            <UserCircle className="w-4 h-4 text-[#2D2D2D]" />
          </div>
          <span className="font-merriweather text-[#2D2D2D]">Profile</span>
        </Link>

        {/* Logout button */}
        <button
          onClick={handlelogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-[#2D2D2D] hover:bg-[#6B4E2E] hover:text-[#F5E6D3]"
        >
          <div className="p-1.5 bg-[#C9B79C] rounded-lg">
            <LogOut className="w-4 h-4 text-[#2D2D2D]" />
          </div>
          <span className="font-merriweather">Logout</span>
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