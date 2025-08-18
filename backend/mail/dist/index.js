import express from 'express';
import dotenv from 'dotenv';
import { startSendOtpConsumer } from './consumer.js';
dotenv.config();
startSendOtpConsumer(); // Start the OTP consumer
const app = express();
app.listen(process.env.PORT, () => {
    console.log(`User service is running on http://localhost:${process.env.PORT}`);
});
//# sourceMappingURL=index.js.map