import type { Request } from "express";
import { Document } from "mongoose";
interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
}
export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
export declare const isAuth: (req: AuthenticatedRequest, res: any, next: any) => Promise<void>;
export {};
//# sourceMappingURL=isAuth.d.ts.map