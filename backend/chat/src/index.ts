import express from 'express';
import dotenv from 'dotenv';
import connectDB from './confiq/db.js'; // Function to connect to MongoDB
import chatRoutes from './route/chat.js'; // Chat-related routes
import cors from 'cors'; // Middleware to handle cross-origin requests
import { app, server } from './confiq/socket.js';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Create an Express application

// const app = express();

// Middleware to parse incoming JSON requests
// Allows access to req.body in routes
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing)
// Allows your frontend to make requests to this backend from a different domain/port
app.use(cors());

// Mount chat routes under "/api/v1"
// All chat endpoints will be prefixed with /api/v1
app.use("/api/v1", chatRoutes);

// Get the port number from environment variables
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT not set

// Start the server and listen for incoming requests

// app.listen(PORT, () => {
server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
