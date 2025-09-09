import type { Request } from "express";
import { Document } from "mongoose";
/**
 * IUser: Mongoose user interface
 * -------------------------------
 * - Represents the structure of a user document in MongoDB.
 */
interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
}
/**
 * AuthenticatedRequest: Extended Express Request
 * -----------------------------------------------
 * - Adds an optional `user` property to Express request object.
 * - This will be populated by `isAuth` middleware after verifying JWT.
 */
export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
/**
 * isAuth Middleware
 * ----------------
 * Purpose:
 * - Protect routes by checking for a valid JWT token in request headers.
 * - Attaches decoded user information to `req.user`.
 */
export declare const isAuth: (req: AuthenticatedRequest, res: any, next: any) => Promise<void>;
export {};
//# sourceMappingURL=isAuth.d.ts.map