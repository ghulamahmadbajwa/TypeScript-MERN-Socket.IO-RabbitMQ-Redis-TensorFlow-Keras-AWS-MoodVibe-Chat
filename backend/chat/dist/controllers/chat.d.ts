/**
 * Controller: createNewChat
 * -------------------------
 * Purpose:
 * - Starts a new chat between two users (the logged-in user and a receiver).
 * - Prevents duplicate chats from being created for the same two people.
 *
 * Flow:
 * - Get the logged-in user (from req.user, set by isAuth middleware).
 * - Get the other user's ID (receiver) from the request body.
 * - Check if a chat already exists between them.
 * - If it exists → return that chat.
 * - If not → create a new chat and return its ID.
 */
export declare const createNewChat: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getUserChats: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=chat.d.ts.map