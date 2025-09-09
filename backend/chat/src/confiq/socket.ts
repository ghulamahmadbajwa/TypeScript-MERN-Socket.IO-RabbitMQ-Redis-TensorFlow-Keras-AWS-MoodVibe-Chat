import { Server, Socket } from "socket.io"
import http from "http"
import express from "express"

// ====================================================
// 1. Create an Express app
// ====================================================
// Express is used to handle normal HTTP requests
// (APIs, serving frontend files, etc.)
const app = express()

// ====================================================
// 2. Wrap Express with an HTTP server
// ====================================================
// Socket.IO needs access to a raw HTTP server
const server = http.createServer(app)

// ====================================================
// 3. Initialize Socket.IO
// ====================================================
// - io is the Socket.IO server instance
// - CORS is required so your frontend can connect
// - In production, restrict origin instead of "*"
const io = new Server(server, {
    cors: {
        origin: "*", // ⚠️ Dev only! (In prod → set frontend URL)
        methods: ["GET", "POST"],
    },
})

// ====================================================
// 4. Track Connected Users
// ====================================================
// userSocketMap = { userId: socketId }
// This lets us:
//   - Show online users
//   - Send private messages
//   - Map between userId ↔ socket
const userSocketMap: Record<string, string> = {};

export const getRecieverSoketId = (recieverId: string): string | undefined => {
    return userSocketMap[recieverId]
}

// Helper: return list of all online userIds
const getOnlineUsers = () => Object.keys(userSocketMap)

// ====================================================
// 5. Handle Client Connections
// ====================================================
io.on("connection", (socket: Socket) => {
    console.log("✅ User connected:", socket.id)

    // ----------------------------------------------------
    // a) Identify user
    // ----------------------------------------------------
    // The frontend passes userId in query params when connecting
    const userId = socket.handshake.query.userId as string | undefined

    // If valid userId → store in map
    if (userId && userId !== "null") {
        userSocketMap[userId] = socket.id
        console.log(`🔗 Mapped user ${userId} → socket ${socket.id}`)
    }

    // Send updated list of online users to ALL clients
    io.emit("getOnlineUser", getOnlineUsers())

    // Also join this user’s personal "room" (userId)
    if (userId) {
        socket.join(userId)
    }

    // ----------------------------------------------------
    // b) Typing indicators
    // ----------------------------------------------------
    // Someone is typing in a specific chat
    socket.on("typing", (data) => {
        console.log(`✏️ User ${data.userId} typing in chat ${data.chatId}`)

        // Broadcast "userTyping" to other users in the same chat
        socket.to(data.chatId).emit("userTyping", {
            chatId: data.chatId,
            userId: data.userId,
        })
    })

    // Someone stopped typing
    socket.on("stopTyping", (data) => {
        console.log(`✏️ User ${data.userId} stopped typing in chat ${data.chatId}`)

        // Broadcast "UserStoppedTyping"
        socket.to(data.chatId).emit("UserStoppedTyping", {
            chatId: data.chatId,
            userId: data.userId,
        })
    })

    // ----------------------------------------------------
    // c) Joining/Leaving Chat Rooms
    // ----------------------------------------------------
    socket.on("joinChat", (chatId) => {
        socket.join(chatId)
        console.log(`👥 User ${userId} joined chat room ${chatId}`)
    })

    socket.on("leaveChat", (chatId) => {
        socket.leave(chatId) // ← fixed (was socket.join)
        console.log(`🚪 User ${userId} left chat room ${chatId}`)
    })

    // ----------------------------------------------------
    // d) Handle Disconnects
    // ----------------------------------------------------
    socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id)

        // Remove user from map if this was their socket
        for (const [uid, sId] of Object.entries(userSocketMap)) {
            if (sId === socket.id) {
                delete userSocketMap[uid]
                console.log(`🗑️ Removed user ${uid} from online list`)
                break
            }
        }

        // Notify everyone about updated online users
        io.emit("getOnlineUser", getOnlineUsers())
    })

    // ----------------------------------------------------
    // e) Connection Errors
    // ----------------------------------------------------
    socket.on("connect_error", (error) => {
        console.error("⚠️ Connection error:", socket.id, error.message)
    })
})

// ====================================================
// 6. Export for use elsewhere
// ====================================================
// In your main entry file (e.g. index.ts):
//   server.listen(PORT, () => console.log(`Running on ${PORT}`));
export { app, server, io }
