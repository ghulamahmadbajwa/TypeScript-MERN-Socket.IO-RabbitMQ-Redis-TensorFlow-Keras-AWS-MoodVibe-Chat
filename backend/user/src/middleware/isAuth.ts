import type { Request } from "express";
import type { IUser } from "../model/user.js";
import jwt, { type JwtPayload } from "jsonwebtoken";


// We're defining a new interface that extends the standard Express Request.
// This is a crucial step for type safety in TypeScript.
// By adding a 'user' property, we tell TypeScript that after our middleware
// runs successfully, the request object will have user data attached to it.
export interface AuthenticatedRequest extends Request {
    user?: IUser | null; // Optional 'user' property can be an IUser object or null.
}

/**
 * This is the core authentication middleware. Its job is to verify
 * a JSON Web Token (JWT) and ensure the user is logged in before
 * a request can proceed to a protected route.
 * * @param req The incoming request object. We're using our custom AuthenticatedRequest type here.
 * @param res The response object used to send data back to the client.
 * @param next A function that passes control to the next middleware or route handler.
 */
export const isAuth = async (req: AuthenticatedRequest, res: any, next: any): Promise<void> => {
    // We use a try...catch block to handle any errors that might occur during
    // token verification, such as an invalid or expired token.
    try {
        // Step 1: Get the Authorization header from the request.
        // This is where the client sends the JWT, typically in the format "Bearer <token>".
        const authHeader = req.headers.authorization;

        // Step 2: Check for the presence and correct format of the header.
        // If the header is missing or doesn't start with "Bearer ", we immediately
        // send a 401 Unauthorized response and stop the request from proceeding.
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Please Login - NO auth header" });
        }
        
        // Step 3: Extract the actual token string from the header.
        const token = authHeader.split(" ")[1];

        // Step 4: Get the secret key from environment variables.
        // This key is used to sign and verify the token's integrity.
        // It's a critical security measure. If it's not defined, it's an internal error.
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            // We throw an error here because the server cannot function without this key.
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        // Step 5: Perform an explicit check to ensure the token exists.
        // This is a safety check to prevent a TypeScript error.
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }
        
        // Step 6: Verify and decode the JWT using the token and the secret key.
        // This is the most crucial part. 'jwt.verify' checks the token's signature.
        // If the token is valid, it returns the decoded payload. If not, it throws an error.
        const decodeValue = jwt.verify(token, secret) as JwtPayload;
        
        // Step 7: Check if the decoded payload contains the expected user data.
        // This ensures that the token is not only valid but also contains the information we need.
        if (!decodeValue || !decodeValue.user) {
            return res.status(401).json({ message: "Invalid token" });
        }
        
        // Step 8: Attach the user data to the request object.
        // This is the magic moment! Now, any subsequent controller or middleware
        // can access the user's information securely from `req.user`.
        req.user = decodeValue.user;

        // Step 9: Call next() to pass control to the next function in the chain.
        // This is what allows the request to continue to the protected route handler.
        next();
    } catch (error) {
        // Step 10: Handle any errors that were caught in the try block.
        // This includes expired tokens, invalid signatures, etc.
        // We send a 401 Unauthorized response to the client.
        res.status(401).json({ message: "Please Login - JWT Error" });
    }
};
