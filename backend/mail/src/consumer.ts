import amqp from 'amqplib';          // RabbitMQ client library
import nodemailer from 'nodemailer'; // Library to send emails
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

/**
 * startSendOtpConsumer
 * -------------------
 * Purpose:
 * - Connects to RabbitMQ and listens for OTP messages in a queue.
 * - Sends OTP emails using Nodemailer when a message arrives.
 */
export async function startSendOtpConsumer() {
    try {
        // 1️⃣ Connect to RabbitMQ server
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD
        });

        // 2️⃣ Create a channel (virtual connection to communicate with the broker)
        const channel = await connection.createChannel();

        // 3️⃣ Declare the queue to listen to
        const queueName = 'send_otp_queue';
        await channel.assertQueue(queueName, { durable: true }); // durable=true keeps messages even if RabbitMQ restarts

        console.log('RabbitMQ consumer is waiting for messages in queue:', queueName);

        // 4️⃣ Start consuming messages from the queue
        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    // 4a: Parse the message content
                    // Expected structure: { to, subject, body }
                    const { to, subject, body } = JSON.parse(msg.content.toString());

                    // 4b: Configure email transporter using SMTP
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com', // Your SMTP server
                        port: 465,              // SMTP port (SSL)
                        auth: {
                            user: process.env.USER,     // Email username
                            pass: process.env.PASSWORD  // Email password / app-specific password
                        }
                    });

                    // 4c: Send the email
                    await transporter.sendMail({
                        from: 'MoodVibe Chat', // Sender address
                        to,                     // Recipient(s)
                        subject,                // Email subject
                        text: body              // Email content (plain text)
                    });

                    console.log(`✅ OTP sent to ${to} successfully`);

                    // 4d: Acknowledge the message so RabbitMQ knows it has been processed
                    channel.ack(msg);
                } catch (error) {
                    // Handle errors for this message
                    console.error('❌ Error sending OTP:', error);
                    // Optionally, do not ack the message so it can be retried
                }
            }
        });
    } catch (error) {
        // Handle errors during RabbitMQ connection/setup
        console.error('❌ Failed to start OTP consumer:', error);
    }
}
