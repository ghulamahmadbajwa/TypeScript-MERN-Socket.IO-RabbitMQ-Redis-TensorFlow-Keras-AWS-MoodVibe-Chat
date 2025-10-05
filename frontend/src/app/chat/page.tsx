'use client'

import { chat_service, useAppContext, User } from '@/context/appContext'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Loading from '@/components/Loading'
import ChatSidebar from '@/components/ChatSidebar'
import ChatHeader from '@/components/ChatHeader'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import axios from 'axios'
import ChatMessages from '@/components/ChatMessages'
import MessageInput from '@/components/MessageInput'
import { SocketData } from '@/context/SocketContext'

// === Interface: Message ===
// Purpose: Defines the shape of a message object received from the backend.
// Key Fields: Includes message ID, chat ID, sender, content (text/image), and status (seen, timestamps).
export interface Message {
  _id: string
  chatId: string
  sender: string
  text?: string
  image?: {
    url: string
    public_id: string
  }
  messageType: 'text' | 'image'
  seen: boolean
  seenAt?: string
  createdAt: string
}

// === Component: PingApp ===
// Purpose: Main chat application component, managing chat UI and real-time interactions.
// Key Logic:
// - Handles authentication, chat selection, message sending, and real-time updates via Socket.IO.
// - Integrates with backend APIs for fetching chats and messages.
// - Maintains local state for UI interactions (e.g., sidebar, typing indicators).
const PingApp = () => {
  // === Global Context ===
  // Purpose: Access shared app state (authentication, user data, chats) from appContext.
  const {
    loading, // Indicates if app data is loading
    isAuth, // Authentication status of the user
    logoutUser, // Function to log out the user
    chats, // List of user's chats
    user: loggedInUser, // Logged-in user's details
    users, // List of all users for creating new chats
    fetchChats, // Function to fetch chats from backend
    setChats, // Function to update chats state
  } = useAppContext()

  // === Socket Context ===
  // Purpose: Manage real-time events (e.g., new messages, typing indicators) via Socket.IO.
  const { onlineUsers, socket } = SocketData()
  console.log('Online users:', onlineUsers) // Debug: Log online users

  // === Local State ===
  // Purpose: Manage component-specific state for UI and interactions.
  const [selectedUser, setSelectedUser] = useState<string | null>(null) // Current chat ID
  const [messages, setMessages] = useState<Message[] | null>(null) // Messages for selected chat
  const [user, setUser] = useState<User | null>(null) // Chat partner's details
  const [message, setMessage] = useState('') // Current input value for message
  const [sidebarOpen, setSidebarOpen] = useState(false) // Sidebar visibility toggle
  const [showAllUsers, setShowAllUsers] = useState(false) // Toggle for showing all users
  const [isTyping, setIsTyping] = useState(false) // Typing indicator for chat partner
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null) // Timeout for typing indicator

  const router = useRouter() // Next.js router for navigation

  // === Effect: Redirect Unauthenticated Users ===
  // Purpose: Redirect to login page if user is not authenticated and loading is complete.
  useEffect(() => {
    if (!isAuth && !loading) {
      router.push('/login')
    }
  }, [isAuth, loading, router])

  // === Effect: Fetch Messages for Selected Chat ===
  // Purpose: Load messages for the selected chat and join the Socket.IO chat room.
  // Key Logic: Fetches messages, resets unseen count, and handles cleanup on chat change.
  useEffect(() => {
    if (selectedUser) {
      fetchChat()
      setIsTyping(false)
      resetUnseenCount(selectedUser)
      socket?.emit('joinChat', selectedUser)
      return () => {
        socket?.emit('leaveChat', selectedUser)
        setMessages(null)
      }
    }
  }, [selectedUser, socket])

  // === Effect: Cleanup Typing Timeout ===
  // Purpose: Clear typing timeout when component unmounts to prevent memory leaks.
  useEffect(() => {
    return () => {
      if (typingTimeOut) clearTimeout(typingTimeOut)
    }
  }, [typingTimeOut])

  // === Function: handleLogout ===
  // Purpose: Log out the user by calling the context's logout function.
  const handleLogout = () => logoutUser()

  // === Function: fetchChat ===
  // Purpose: Fetch messages and chat partner details for the selected chat from the backend.
  const fetchChat = async () => {
    if (!selectedUser) return
    const token = Cookies.get('token')

    try {
      const { data } = await axios.get(
        `${chat_service}/api/v1/message/${selectedUser}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(data.messages)
      setUser(data.user)
    } catch (error) {
      console.error('❌ Failed to load messages:', error)
      toast.error('Failed to load chat thread')
    }
  }

  // === Function: createChat ===
  // Purpose: Start a new chat with a selected user.
  const createChat = async (u: User) => {
    try {
      const token = Cookies.get('token')
      if (!loggedInUser?._id || !u._id) {
        toast.error('User not found')
        return
      }
      const { data } = await axios.post(
        `${chat_service}/api/v1/chat/new`,
        { userId: loggedInUser._id, receiverId: u._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSelectedUser(data.chatId)
      setShowAllUsers(false)
      await fetchChats()
    } catch (error: any) {
      console.error('❌ Chat creation error:', error.response?.data || error.message)
      toast.error('Failed to start chat')
    }
  }

  // === Function: resetUnseenCount ===
  // Purpose: Reset the unseen message count for a specific chat when it is selected.
  const resetUnseenCount = (chatId: string) => {
    setChats((prev) => {
      if (!prev) return null
      return prev.map((chat) => {
        if (chat.chat._id === chatId) {
          return {
            ...chat,
            chat: { ...chat.chat, unseenCount: 0 }
          }
        }
        return chat
      })
    })
  }

  // === Function: moveChatToTop ===
  // Purpose: Move a chat to the top when a new message is sent.
  const moveChatToTop = (
    chatId: string,
    newMessage: Message,
    updateUnseenCount = true
  ) => {
    setChats((prev) => {
      if (!prev) return null
      const updatedChats = [...prev]
      const chatIndex = updatedChats.findIndex((chat) => chat.chat._id === chatId)
      if (chatIndex !== -1) {
        const [movedChat] = updatedChats.splice(chatIndex, 1)
        const unseenCount =
          updateUnseenCount && newMessage.sender !== loggedInUser?._id
            ? (movedChat.chat.unseenCount || 0) + 1
            : movedChat.chat.unseenCount || 0
        const updatedChat = {
          ...movedChat,
          chat: {
            ...movedChat.chat,
            latestMessage: {
              text: newMessage.text || '',
              sender: newMessage.sender
            },
            updatedAt: new Date().toISOString(),
            unseenCount
          }
        }
        updatedChats.unshift(updatedChat)
      }
      return updatedChats
    })
  }

  // === Function: handleMessageSend ===
  // Purpose: Send a new message (text or image) into the selected chat.
  const handleMessageSend = async (e: React.FormEvent, imageFile?: File | null) => {
    e.preventDefault()
    if (!selectedUser) return
    if (!message.trim() && !imageFile) return

    if (typingTimeOut) {
      clearTimeout(typingTimeOut)
      setTypingTimeOut(null)
    }
    socket?.emit('stopTyping', {
      chatId: selectedUser,
      userId: loggedInUser?._id
    })

    const token = Cookies.get('token')

    try {
      const formData = new FormData()
      formData.append('chatId', selectedUser)
      if (message.trim()) formData.append('text', message.trim())
      if (imageFile) formData.append('image', imageFile)

      const { data } = await axios.post(
        `${chat_service}/api/v1/message`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const newMessage: Message = {
        _id: data.messageData._id,
        chatId: data.messageData.chatId,
        sender: data.messageData.sender,
        text: data.messageData.text,
        image: data.messageData.image,
        messageType: data.messageData.messageType,
        seen: data.messageData.seen,
        seenAt: data.messageData.seenAt || undefined,
        createdAt: data.messageData.createdAt
      }

      setMessages((prev) => (prev ? [...prev, newMessage] : [newMessage]))
      setMessage('')
      moveChatToTop(selectedUser, newMessage, false)
      await fetchChats()
    } catch (error: any) {
      console.error('❌ Send message error:', error.response?.data || error.message)
      if (error.response?.status === 413) {
        toast.error('File too large. Please choose a smaller image.')
      } else if (error.response?.status === 415) {
        toast.error('Unsupported file type. Please use JPEG, PNG, or GIF.')
      } else {
        toast.error(error.response?.data?.message || 'Failed to send message')
      }
    }
  }

  // === Function: handleTyping ===
  // Purpose: Handle typing indicator logic when user writes in the message input.
  const handleTyping = (value: string) => {
    setMessage(value)
    if (!selectedUser || !socket) return
    if (value.trim()) {
      socket.emit('typing', { chatId: selectedUser, userID: loggedInUser?._id })
    }
    if (typingTimeOut) clearTimeout(typingTimeOut)
    const timeout = setTimeout(() => {
      socket.emit('stopTyping', {
        chatId: selectedUser,
        userID: loggedInUser?._id
      })
    }, 2000)
    setTypingTimeOut(timeout)
  }

  // === Effect: Listen for Real-Time Events ===
  // Purpose: Handle Socket.IO events for new messages and typing indicators.
  useEffect(() => {
    socket?.on('newMessage', (message) => {
      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const current = prev || []
          const exists = current.some((msg) => msg._id === message._id)
          return exists ? current : [...current, message]
        })
        moveChatToTop(message.chatId, message, false)
      } else {
        moveChatToTop(message.chatId, message, true)
      }
    })

    socket?.on("messagesSeen", (data) => {
      if (selectedUser === data.chatId) {
        setMessages((prev) => {
          if (!prev) return null
          return prev.map((msg) => {
            if (msg.sender === loggedInUser?._id && (!data.messageIds || data.messageIds.includes(msg._id))) {
              return { ...msg, seen: true, seenAt: new Date().toISOString() }
            }
            return msg
          })
        })
      }
    })

    socket?.on('userTyping', (data) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(true)
      }
    })

    socket?.on('UserStoppedTyping', (data) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(false)
      }
    })

    return () => {
      socket?.off('newMessage')
      socket?.off('messagesSeen')
      socket?.off('userTyping')
      socket?.off('UserStoppedTyping')
    }
  }, [socket, selectedUser, loggedInUser?._id, moveChatToTop])

  // === Render ===
  if (loading) return <Loading />

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 text-gray-800 relative overflow-hidden">
      {/* Sidebar: Displays chats and user list */}
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
        users={users}
        loggedInUser={loggedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handlelogout={handleLogout}
        createChat={createChat}
        onlineUsers={onlineUsers}
      />

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/70 border border-purple-200 shadow-lg rounded-l-2xl">
        {/* Header: Displays partner info, typing indicator, and online status */}
        <ChatHeader
          user={user}
          setSidebarOpen={setSidebarOpen}
          isTyping={isTyping}
          onlineUsers={onlineUsers}
        />

        {/* Messages: Displays the chat's history */}
        <ChatMessages
          selectedUser={selectedUser}
          messages={messages}
          loggedInUser={loggedInUser}
        />

        {/* Message Input: Allows sending text or image messages */}
        <MessageInput
          selectedUser={selectedUser}
          message={message}
          setMessage={handleTyping}
          handleMessageSend={handleMessageSend}
        />
      </div>
    </div>
  )
}

export default PingApp