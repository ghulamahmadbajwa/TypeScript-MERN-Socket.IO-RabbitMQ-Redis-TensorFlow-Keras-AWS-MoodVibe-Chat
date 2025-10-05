import { User } from '@/context/appContext'
import { Menu, UserCircle } from 'lucide-react'
import React from 'react'

interface ChatHeaderProps {
  user: User | null
  setSidebarOpen: (open: boolean) => void
  isTyping: boolean
  onlineUsers: string[]
}

const ChatHeader = ({ user, setSidebarOpen, isTyping, onlineUsers }: ChatHeaderProps) => {
  const isOnlineUser = user && onlineUsers.includes(user._id)

  return (
    <>
      {/* Mobile sidebar toggle (only visible on small screens) */}
      <div className="sm:hidden fixed top-4 right-4 z-30">
        <button
          className="p-2 bg-[#C9B79C] rounded-full hover:bg-[#A67B5B] transition-colors shadow-md"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5 text-[#6B4E2E]" />
        </button>
      </div>

      {/* Chat header container */}
      <div className="mb-6 bg-[#F5E6D3] rounded-xl border border-[#C9B79C] p-5 shadow-md" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Avatar + Online Indicator */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#C9B79C] flex items-center justify-center border-2 border-[#A67B5B]">
                  <UserCircle className="w-7 h-7 text-[#2D2D2D]" />
                </div>
                {isOnlineUser && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#6B4E2E] border-2 border-[#F5E6D3]">
                    <span className="absolute inset-0 rounded-full bg-[#6B4E2E] animate-ping opacity-75"></span>
                  </span>
                )}
              </div>

              {/* Username + Status */}
              <div className="flex-1 min-w-0">
                {/* Username */}
                <h2 className="text-xl font-serif font-bold text-[#2D2D2D] truncate font-merriweather">
                  {user.username}
                </h2>

                {/* Status line (typing OR online/offline) */}
                {isTyping ? (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-[#6B4E2E] rounded-full animate-bounce"></div>
                      <div
                        className="w-1.5 h-1.5 bg-[#6B4E2E] rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-[#6B4E2E] rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                    <span className="text-[#6B4E2E] font-merriweather">writing a message...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isOnlineUser ? 'bg-[#6B4E2E]' : 'bg-[#2D2D2D]'
                      }`}
                    ></div>
                    <span
                      className={`text-sm font-merriweather ${
                        isOnlineUser ? 'text-[#6B4E2E]' : 'text-[#2D2D2D]'
                      }`}
                    >
                      {isOnlineUser ? 'Active in Ping' : 'Away'}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Placeholder when no chat is selected */
            <div className="flex items-center gap-4 text-[#2D2D2D]">
              <div className="w-12 h-12 rounded-full bg-[#C9B79C] flex items-center justify-center border-2 border-[#A67B5B]">
                <UserCircle className="w-7 h-7 text-[#2D2D2D]" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-[#2D2D2D] font-merriweather">
                  Select a Chat
                </h2>
                <p className="text-sm text-[#2D2D2D] font-merriweather mt-1">
                  Choose a friend to start chatting 🚀
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ChatHeader