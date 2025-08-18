/**
 * Controller function for user login.
 * This route is responsible for handling the initial login request,
 * generating a one-time password (OTP), and sending it to the user.
 *
 * @param req The request object containing the user's email in the body.
 * @param res The response object used to send back a confirmation message.
 */
export declare const loginUser: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Controller function for OTP verification.
 * This route is responsible for validating the OTP submitted by the user.
 * If the OTP is correct, it logs the user in, creates a new user if necessary,
 * generates a JWT, and sends it back to the client.
 *
 * @param req The request object containing the user's email and entered OTP in the body.
 * @param res The response object used to send back a status message and JWT token.
 */
export declare const verifyOtp: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const myprofile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const updateName: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getallUsers: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getUser: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=user.d.ts.map