import tryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { publishToQueue } from "../config/rabbitmq.js";
export const loginUser = tryCatch(async (req, res) => {
    const { email } = req.body;
    // Logic to authenticate user
    // If successful, send a response
    const ratelimitKey = `otp:ratelimit:${email}`;
    const ratelimit = await redisClient.get(ratelimitKey);
    if (ratelimit) {
        return res.status(429).json({
            error: "Too many requests, please try again later."
        });
    }
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp.toString(), {
        EX: 300 // OTP expires in 5 minutes  
    });
    await redisClient.set(ratelimitKey, "1", {
        EX: 60 // Rate limit for 1 minute
    });
    const message = {
        to: email,
        subject: "Your OTP Code",
        body: `Your OTP code is ${otp}. It is valid for 5 minutes.`
    };
    await publishToQueue("send_otp_queue", message);
    res.status(200).json({
        message: "OTP sent successfully. Please check your email."
    });
});
//# sourceMappingURL=user.js.map