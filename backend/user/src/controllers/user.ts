import tryCatch from "../config/TryCatch.js"; 
import { redisClient } from "../index.js";
import { publishToQueue } from "../config/rabbitmq.js";
import { User } from "../model/user.js";
import { generateToken } from "../config/generateToken.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import type { IUser } from "../model/user.js";

/**
 * Controller function for user login.
 * This route is responsible for handling the initial login request,
 * generating a one-time password (OTP), and sending it to the user.
 *
 * @param req The request object containing the user's email in the body.
 * @param res The response object used to send back a confirmation message.
 */
export const loginUser = tryCatch(async (req, res) => {
    const { email } = req.body;

    // --- Rate Limiting Check ---
    // This prevents a single user from requesting too many OTPs in a short period.
    // A key is created in Redis for the user's email.
    const ratelimitKey = `otp:ratelimit:${email}`;
    const ratelimit = await redisClient.get(ratelimitKey);
    if (ratelimit) {
        return res.status(429).json({
            error: "Too many requests, please try again later."
        });
    }

    // --- OTP Generation and Storage ---
    // Generate a random 6-digit number to serve as the OTP.
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Create a key in Redis to store the OTP, tied to the user's email.
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp.toString(), {
        EX: 300 // Set an expiration time of 300 seconds (5 minutes) for the OTP.
    });

    // Set the rate limit key in Redis, which will expire in 60 seconds (1 minute).
    // This prevents the user from requesting another OTP for one minute.
    await redisClient.set(ratelimitKey, "1", {
        EX: 60
    });

    // --- OTP Delivery ---
    // Create a message object containing the recipient's email and the OTP.
    const message = {
        to: email,
        subject: "Your OTP Code",
        body: `Your OTP code is ${otp}. It is valid for 5 minutes.`
    };
    // Publish the message to a RabbitMQ queue. A separate worker will consume this message
    // and handle the actual sending of the OTP via email. This makes the request non-blocking.
    await publishToQueue("send_otp_queue", message);

    // Send a success response to the client.
    res.status(200).json({
        message: "OTP sent successfully. Please check your email."
    });
});

/**
 * Controller function for OTP verification.
 * This route is responsible for validating the OTP submitted by the user.
 * If the OTP is correct, it logs the user in, creates a new user if necessary,
 * generates a JWT, and sends it back to the client.
 *
 * @param req The request object containing the user's email and entered OTP in the body.
 * @param res The response object used to send back a status message and JWT token.
 */
export const verifyOtp = tryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;

    // --- Input Validation ---
    // Check if both email and OTP were provided in the request body.
    if (!email || !enteredOtp) {
        res.status(400).json({
            error: "Email and OTP are required."
        });
        return;
    }

    // --- OTP Retrieval and Validation ---
    const otpKey = `otp:${email}`;
    // Retrieve the OTP from Redis using the user's email as the key.
    const storedOtp = await redisClient.get(otpKey);

    // Check if an OTP was found in Redis. If not, it means it has expired or was never sent.
    if (!storedOtp) {
        return res.status(400).json({
            error: "OTP has expired or does not exist."
        });
    }

    // Compare the entered OTP with the OTP stored in Redis.
    if (storedOtp !== enteredOtp) {
        // If the OTPs don't match, send an error response.
        return res.status(400).json({
            error: "Invalid OTP."
        });
    }

    // --- Successful Verification and User Login ---
    // If the OTPs match, we've successfully verified the user.
    if (storedOtp === enteredOtp) {
        // Delete the OTP from Redis to prevent it from being used again.
        await redisClient.del(otpKey);

        // Find the user in the database by their email.
        let user = await User.findOne({ email });

        // If the user doesn't exist, create a new one.
        if (!user) {
            // Use a part of the email as a temporary username.
            const username = email.slice(0, 8);
            user = await User.create({ email, username });
        }

        // Generate a JWT token for the user.
        // This token will be used for all future authenticated requests.
        const token = generateToken(user);

        // Send a success response back to the client with the message, token, and user data.
        return res.status(200).json({
            message: "OTP verified successfully.",
            token,
            user,
        });
    }
});


export const myprofile = tryCatch(async (req: AuthenticatedRequest, res) => {
    // The user data is already attached to the request object by the isAuth middleware.
    const user = req.user;

    res.json(user);
});



export const updateName = tryCatch(async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.user?._id) as IUser;
    if (!user) {
        return res.status(404).json({ message: "User not found - Please login" });
    }
    user.username = req.body.name; // Now TypeScript knows 'name' exists on the 'user' object.
    await user.save();
    const token = generateToken(user);
    res.json({ message: "Name updated successfully", token, user });
});



export const getallUsers = tryCatch(async (req: AuthenticatedRequest, res) => {
    const users = await User.find();
    res.json(users);
});



export const getUser = tryCatch(async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

