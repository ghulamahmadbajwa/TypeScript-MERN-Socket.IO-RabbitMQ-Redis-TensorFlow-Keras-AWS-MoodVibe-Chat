// Import JWT functions and types
import jwt from "jsonwebtoken";
// Import Mongoose Document type for user interface
import { Document } from "mongoose";
/**
 * isAuth Middleware
 * ----------------
 * Purpose:
 * - Protect routes by checking for a valid JWT token in request headers.
 * - Attaches decoded user information to `req.user`.
 */
export const isAuth = async (req, res, next) => {
    try {
        // 1️⃣ Get the Authorization header from the request
        const authHeader = req.headers.authorization;
        // 2️⃣ Check if header exists and starts with "Bearer "
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Please Login - NO auth header" });
        }
        // 3️⃣ Extract the token string (after "Bearer ")
        const token = authHeader.split(" ")[1];
        // 4️⃣ Get JWT secret from environment variables
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }
        // 5️⃣ Verify token using JWT secret
        // decodeValue will contain the payload encoded in the token
        const decodeValue = jwt.verify(token, secret);
        // 6️⃣ Check if decoded payload contains user info
        if (!decodeValue || !decodeValue.user) {
            return res.status(401).json({ message: "Invalid token" });
        }
        // 7️⃣ Attach user info to request object for use in protected routes
        req.user = decodeValue.user;
        // 8️⃣ Call next middleware/route handler
        next();
    }
    catch (error) {
        // 9️⃣ Catch verification errors (expired, invalid token, etc.)
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Please Login - JWT Error" });
    }
};
//# sourceMappingURL=isAuth.js.map