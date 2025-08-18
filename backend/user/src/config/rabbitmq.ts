import amqp from 'amqplib';
//More specifically, amqplib is the official package name on npm. By convention, when you import it, you often name the imported module amqp in your code, like this: import amqp from 'amqplib';. This makes it a concise and clear reference to the library's functionality.The library provides all the necessary methods, like connect, createChannel, and assertQueue, to interact with a RabbitMQ server. It implements the AMQP protocol (Advanced Message Queuing Protocol), which is the standard protocol for message brokers. So, amqp in your code is just the name you've given to the tool you're using


let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD
        });
        channel = await connection.createChannel();
        console.log('RabbitMQ channel created successfully');
    } catch (error) {
        console.error('Failed to create RabbitMQ channel:', error);
        throw error; // Re-throw the error for further handling
    }
}// This function is responsible for establishing a connection to the RabbitMQ server and creating a channel.

export const publishToQueue = async (queueName: string, message: any) => {
    try {
        if (!channel) {
            throw new Error('RabbitMQ channel is not initialized');
        }
        await channel.assertQueue(queueName, { durable: true });
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log(`Message sent to queue ${queueName}:`, message);
    } catch (error) {
        console.error('Failed to send message to RabbitMQ queue:', error);
        throw error; // Re-throw the error for further handling
    }
}// This function takes a queue name and a message and sends the message to the specified queue.
