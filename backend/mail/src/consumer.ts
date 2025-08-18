import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export async function startSendOtpConsumer() {
	try {
		const connection = await amqp.connect({
			protocol: 'amqp', 
			hostname: process.env.RABBITMQ_HOST,
			port: 5672,
			username: process.env.RABBITMQ_USER,
			password: process.env.RABBITMQ_PASSWORD
		});
		const channel = await connection.createChannel();
		const queueName = 'send_otp_queue';
		await channel.assertQueue(queueName, { durable: true });
		console.log('RabbitMQ consumer is waiting for messages in queue:', queueName);
		channel.consume(queueName, async (msg) => {
			if (msg) {
				try {
					const { to, subject, body } = JSON.parse(msg.content.toString());
					const transporter = nodemailer.createTransport({
						host: 'smtp.gmail.com', // Replace with your SMTP server
						port: 465, // Replace with your SMTP port
						auth: {
							user: process.env.USER, // Your email username
							pass: process.env.PASSWORD // Your email password
						}
					});
					await transporter.sendMail({
						from: 'MoodVibe Chat', // Sender address}
						to, // List of recipients
						subject, // Subject line   
						text: body // Plain text body
					});
					console.log(`OTP sent to ${to} successfully`);
					channel.ack(msg); // Acknowledge the message
				} catch (error) {
					console.error('Error sending OTP:', error);
				}
			}
		});
	} catch (error) {
		console.error('Failed to send otp:', error);
	}
}