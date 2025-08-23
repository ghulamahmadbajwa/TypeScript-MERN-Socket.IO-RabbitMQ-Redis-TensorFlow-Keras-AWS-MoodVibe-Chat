import express from 'express';
import dotenv from 'dotenv';
import { connect } from 'mongoose';
import connectDB from './confiq/db.js';
import chatRoutes from './route/chat.js';
dotenv.config();
connectDB();
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use("/api/v1", chatRoutes);
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map