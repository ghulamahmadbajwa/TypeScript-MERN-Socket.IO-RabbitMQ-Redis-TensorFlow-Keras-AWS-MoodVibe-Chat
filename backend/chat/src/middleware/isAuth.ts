    import type { Request } from "express";
    import jwt from "jsonwebtoken";
    import type { JwtPayload } from "jsonwebtoken";
    import { Document } from "mongoose";



    interface IUser extends Document {
        _id: string;
        name: string;
        email: string;
        // Add other user properties as needed
    }

    export interface AuthenticatedRequest extends Request {
        user?: IUser | null; // Optional 'user' property can be an IUser object or null.
    }


    export const isAuth = async (req: AuthenticatedRequest, res: any, next: any): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ message: "Please Login - NO auth header" });
            }

            const token = authHeader.split(" ")[1];
            const secret = process.env.JWT_SECRET;

            if (!secret) {
                throw new Error("JWT_SECRET is not defined in environment variables");
            } 

            if (!token) {
                return res.status(401).json({ message: "Token missing" });
            }

            const decodeValue = jwt.verify(token, secret) as JwtPayload;

            if (!decodeValue || !decodeValue.user) {
                return res.status(401).json({ message: "Invalid token" });
            }

            // Assuming you have a function to fetch user by ID
            req.user = decodeValue.user;

            next();
        } catch (error) {
            console.error("Authentication error:", error);
            res.status(401).json({ message: "Please Login - JWT Error" });
        }
    }