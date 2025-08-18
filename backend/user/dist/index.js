import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import mongoose from "mongoose";
import { createClient } from 'redis';
import userRoutes from './routes/user.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import cors from 'cors';
dotenv.config(); //dotenv.config(): When you call this function, it reads the .env file and adds all the variables defined within it to the Node.js process.env object.
connectRabbitMQ(); // Connect to RabbitMQ
// Validate REDIS_URL
if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not defined in the environment variables');
} // This if statement checks to see if process.env.REDIS_URL is a "falsy" value. In this context, a falsy value would be undefined, which is what process.env.REDIS_URL would be if it's not set in your .env file. If the REDIS_URL is missing, the code immediately stops (throws an error), preventing the next line from ever running.// If the if statement's condition is false (meaning process.env.REDIS_URL does have a value), the code proceeds to the next block. At this point, because of the check you just performed, TypeScript knows for sure that process.env.REDIS_URL is a string and not undefined.  This is how you satisfy the type checker.
// Create Redis client
export const redisClient = createClient({
    url: process.env.REDIS_URL
});
redisClient
    .connect()
    .then(() => { console.log('Redis client connected successfully'); })
    .catch((error) => { console.error('Redis client connection failed:', error); });
mongoose.set('debug', true); //his line should be placed at the very beginning of your application's entry file (e.g., app.js or server.js), before the connectDB() or any other Mongoose connection logic is called. Placing it early ensures that all subsequent Mongoose interactions, including the connection process itself and all queries, are logged.
connectDB();
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS for all routes
app.use("/api/v1", userRoutes); // Use user routes
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`User service is running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map