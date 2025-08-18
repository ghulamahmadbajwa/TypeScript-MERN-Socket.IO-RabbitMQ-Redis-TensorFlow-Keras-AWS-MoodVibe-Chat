import type { Request } from "express";
import type { IUser } from "../model/user.js";
export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
/**
 * This is the core authentication middleware. Its job is to verify
 * a JSON Web Token (JWT) and ensure the user is logged in before
 * a request can proceed to a protected route.
 * * @param req The incoming request object. We're using our custom AuthenticatedRequest type here.
 * @param res The response object used to send data back to the client.
 * @param next A function that passes control to the next middleware or route handler.
 */
export declare const isAuth: (req: AuthenticatedRequest, res: any, next: any) => Promise<void>;
//# sourceMappingURL=isAuth.d.ts.map