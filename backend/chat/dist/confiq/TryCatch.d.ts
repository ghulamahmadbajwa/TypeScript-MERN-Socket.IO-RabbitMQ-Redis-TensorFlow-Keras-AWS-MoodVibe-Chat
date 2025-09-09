import type { RequestHandler } from "express";
/**
 * tryCatch: A higher-order function to handle async errors in Express routes
 * --------------------------------------------------------------------------
 * @param handler - An async Express route handler or middleware function.
 * @returns A new Express-compatible async function that wraps `handler` in a try/catch.
 *
 * Purpose:
 * - Eliminates repetitive try/catch blocks in each route.
 * - Automatically catches any async errors and sends a 500 response.
 */
declare const tryCatch: (handler: RequestHandler) => RequestHandler;
export default tryCatch;
//# sourceMappingURL=TryCatch.d.ts.map