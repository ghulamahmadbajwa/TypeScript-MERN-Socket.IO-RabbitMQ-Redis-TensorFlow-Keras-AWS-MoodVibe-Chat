import express from 'express';
import dotenv from 'dotenv';
import { startSendOtpConsumer } from './consumer.js'; // Function to start RabbitMQ OTP consumer

// Load environment variables from .env file
dotenv.config();  

// 1️⃣ Start the RabbitMQ consumer for sending OTPs
// This runs in the background and listens to the 'send_otp_queue' for new messages
startSendOtpConsumer();  

// 2️⃣ Create an Express application
const app = express();

// 3️⃣ Start the server to listen for incoming HTTP requests
app.listen(process.env.PORT, () => {
  console.log(`✅ User service is running on http://localhost:${process.env.PORT}`);
});
