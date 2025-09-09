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

// === Component: ChatApp ===
// Purpose: Main chat application component, managing chat UI and real-time interactions.
// Key Logic:
// - Handles authentication, chat selection, message sending, and real-time updates via Socket.IO.
// - Integrates with backend APIs for fetching chats and messages.
// - Maintains local state for UI interactions (e.g., sidebar, typing indicators).
const ChatApp = () => {
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
      // Fetch messages for the selected chat
      fetchChat()
      // Reset typing indicator
      setIsTyping(false)
      // Reset unseen message count for the chat
      resetUnseenCount(selectedUser)

      // Join Socket.IO chat room for real-time updates
      socket?.emit('joinChat', selectedUser)

      // Cleanup: Leave chat room and clear messages when chat changes
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
  // Key Logic: Makes an API call to retrieve messages and user data, handles errors gracefully.
  const fetchChat = async () => {
    if (!selectedUser) return
    const token = Cookies.get('token') // Get auth token from cookies

    try {
      // Fetch messages and user data from backend
      const { data } = await axios.get(
        `${chat_service}/api/v1/message/${selectedUser}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Update state with fetched messages and user data
      setMessages(data.messages)
      setUser(data.user)
    } catch (error) {
      // Log and display error if message fetch fails
      console.error('❌ Failed to load messages:', error)
      toast.error('Failed to load messages')
    }
  }

  // === Function: createChat ===
  // Purpose: Start a new chat with a selected user.
  // Key Logic: Sends a POST request to create a chat, opens it, and refreshes the chat list.
  const createChat = async (u: User) => {
    try {
      const token = Cookies.get('token')
      // Validate user IDs
      if (!loggedInUser?._id || !u._id) {
        toast.error('User not found')
        return
      }

      // Create new chat via API
      const { data } = await axios.post(
        `${chat_service}/api/v1/chat/new`,
        { userId: loggedInUser._id, receiverId: u._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Open the new chat and hide user list
      setSelectedUser(data.chatId)
      setShowAllUsers(false)
      // Refresh chat list to include new chat
      await fetchChats()
    } catch (error: any) {
      // Log and display error if chat creation fails
      console.error('❌ Chat creation error:', error.response?.data || error.message)
      toast.error('Failed to start chat')
    }
  }

  // === Function: resetUnseenCount ===
  // Purpose: Reset the unseen message count for a specific chat when it is selected.
  // Key Logic: Updates the chats state to set unseenCount to 0 for the given chat ID.
  const resetUnseenCount = (chatId: string) => {
    setChats((prev) => {
      if (!prev) return null
      return prev.map((chat) => {
        if (chat.chat._id === chatId) {
          return {
            ...chat,
            chat: {
              ...chat.chat,
              unseenCount: 0
            }
          }
        }
        return chat
      })
    })
  }

  // === Function: moveChatToTop ===
  // Purpose: Move a chat to the top of the chat list when a new message is received.
  // Key Logic: Updates the chats state by reordering the chat and updating its metadata.
  const moveChatToTop = (
    chatId: string,
    newMessage: Message,
    updateUnseenCount = true
  ) => {
    console.log(`🔍 DEBUG: moveChatToTop called with chatId: ${chatId}, updateUnseenCount: ${updateUnseenCount}`);
    setChats((prev) => {
      if (!prev) return null

      // Create a copy of the chats array
      const updatedChats = [...prev]
      console.log(`🔍 DEBUG: Current chats array:`, updatedChats.map(chat => ({ id: chat.chat._id, latestMessage: chat.chat.latestMessage })));
      
      // Find the index of the chat to move
      const chatIndex = updatedChats.findIndex((chat) => chat.chat._id === chatId)
      console.log(`🔍 DEBUG: Looking for chatId: ${chatId}`);
      console.log(`🔍 DEBUG: Found chat at index: ${chatIndex}`);

      if (chatIndex !== -1) {
        // Remove the chat from its current position
        const [movedChat] = updatedChats.splice(chatIndex, 1)

        // Calculate new unseen count (increment if message is from another user)
        const unseenCount =
          updateUnseenCount && newMessage.sender !== loggedInUser?._id
            ? (movedChat.chat.unseenCount || 0) + 1
            : movedChat.chat.unseenCount || 0

        // Update chat with new message and timestamp
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

        // Place updated chat at the top
        updatedChats.unshift(updatedChat)
      }

      return updatedChats
    })
  }

  // === Function: handleMessageSend ===
  // Purpose: Send a text or image message to the selected chat.
  // Key Logic: Sends message via API, updates UI, and refreshes chat list.
  const handleMessageSend = async (e: React.FormEvent, imageFile?: File | null) => {
    e.preventDefault()
    if (!selectedUser) return

    // Block empty submissions
    if (!message.trim() && !imageFile) {
      console.warn('⚠️ Empty message blocked')
      return
    }

    // Stop typing indicator when sending message
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
      // Prepare message payload using FormData
      const formData = new FormData()
      formData.append('chatId', selectedUser)
      if (message.trim()) formData.append('text', message.trim())
      if (imageFile) formData.append('image', imageFile)

      // Debug: Log FormData entries
      for (const [key, value] of formData.entries()) {
        console.log('FormData entry:', key, value)
      }

      // Send message to backend
      const { data } = await axios.post(
        `${chat_service}/api/v1/message`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Build new message object from response
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

      // Update messages in UI and clear input
      setMessages((prev) => (prev ? [...prev, newMessage] : [newMessage]))
      setMessage('')
      
      // Move chat to top when you send a message
      moveChatToTop(selectedUser, newMessage, false)
      
      // Refresh chat list to update order
      await fetchChats()
    } catch (error: any) {
      // Log and display specific error messages
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
  // Purpose: Handle typing indicator logic when user types in the message input.
  // Key Logic: Emits typing events via Socket.IO and sets a timeout to stop typing.
  const handleTyping = (value: string) => {
    setMessage(value)

    if (!selectedUser || !socket) return

    // Emit typing event if input is non-empty
    if (value.trim()) {
      socket.emit('typing', {
        chatId: selectedUser,
        userID: loggedInUser?._id
      })
    }

    // Clear existing timeout
    if (typingTimeOut) clearTimeout(typingTimeOut)

    // Set timeout to stop typing after 2 seconds of inactivity
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
  // Key Logic: Updates messages and chat order for new messages, toggles typing indicators.
  useEffect(() => {
    // Handle new message event
    socket?.on('newMessage', (message) => {
      console.log('🔍 DEBUG: Received newMessage event:', message);
      console.log('🔍 DEBUG: Current selectedUser:', selectedUser);
      console.log('🔍 DEBUG: Message chatId:', message.chatId);

      // Update messages if the message belongs to the current chat
      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const currentMessages = prev || []
          // Prevent duplicate messages
          const messageExists = currentMessages.some((msg) => msg._id === message._id)
          if (!messageExists) {
            return [...currentMessages, message]
          }
          return currentMessages
        })

        // Move chat to top without incrementing unseen count (since chat is open)
        console.log('🔍 DEBUG: Moving current chat to top (no unseen count)');
        moveChatToTop(message.chatId, message, false)
      } else {
        // If message is for a different chat, move it to top with unseen count increment
        console.log('🔍 DEBUG: Moving other chat to top (with unseen count)');
        moveChatToTop(message.chatId, message, true)
      }
    })

    socket?.on("messagesSeen", (data) => {
      console.log("🔍 DEBUG: Received messagesSeen event:", data);
      console.log("🔍 DEBUG: Current selectedUser:", selectedUser);
      console.log("🔍 DEBUG: Current loggedInUser:", loggedInUser?._id);

      if (selectedUser === data.chatId) {
        console.log("🔍 DEBUG: Chat ID matches, updating messages...");
        setMessages((prev) => {
          if (!prev) return null;
          return prev.map((msg) => {
            if (msg.sender === loggedInUser?._id && data.messageIds && data.messageIds.includes(msg._id)) {
              return {
                ...msg,
                seen: true,
                seenAt: new Date().toISOString()
              }

            } else if (msg.sender === loggedInUser?._id && !data.messageIds) {
              return { 
                ...msg,
                seen: true,
                seenAt: new Date().toISOString()
              }
            }
            return msg
          })
        })
      }
    })

    // Handle typing event from other user
    socket?.on('userTyping', (data) => {
      console.log('📩 Received typing event:', data)
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(true)
      }
    })

    // Handle stop typing event from other user
    socket?.on('UserStoppedTyping', (data) => {
      console.log('📩 Received stopTyping event:', data)
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(false)
      }
    })

    // Cleanup: Remove event listeners on unmount
    return () => {
      socket?.off('newMessage')
      socket?.off('messagesSeen')
      socket?.off('userTyping')
      socket?.off('UserStoppedTyping')
    }
  }, [socket, selectedUser, loggedInUser?._id, moveChatToTop])

  // === Render ===
  // Purpose: Render the chat UI with sidebar, header, messages, and input.
  if (loading) return <Loading />

  return (
    <div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden">
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
      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10">
        {/* Header: Displays chat partner info, typing indicator, and online status */}
        <ChatHeader
          user={user}
          setSidebarOpen={setSidebarOpen}
          isTyping={isTyping}
          onlineUsers={onlineUsers}
        />

        {/* Messages: Displays the chat's message history */}
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

export default ChatApp