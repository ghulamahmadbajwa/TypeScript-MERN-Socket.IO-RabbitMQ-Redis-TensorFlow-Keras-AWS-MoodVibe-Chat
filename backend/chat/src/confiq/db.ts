// Import mongoose, an ODM (Object Data Modeling) library for MongoDB
// It allows us to define schemas, models, and interact with MongoDB using JS/TS
import mongoose from "mongoose";

// Async function to connect to MongoDB
const connectDB = async () => {
    // Get MongoDB URI from environment variables
    // This keeps sensitive info (like DB credentials) out of your codebase
    const url = process.env.MONGO_URI;

    // Check if MONGO_URI is set in .env, if not, throw an error immediately
    if (!url) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }

    try {
        // mongoose.connect returns a promise, so we await it
        // This establishes a connection to the MongoDB database
        await mongoose.connect(url);

        // If connection succeeds, log a success message
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        // If connection fails, log the error for debugging
        console.error("❌ MongoDB connection failed:", error);

        // Exit the Node.js process with a failure code
        // This prevents the app from running without a database
        process.exit(1);
    }
};

// Export the connectDB function so it can be called in your server entry point
export default connectDB;
