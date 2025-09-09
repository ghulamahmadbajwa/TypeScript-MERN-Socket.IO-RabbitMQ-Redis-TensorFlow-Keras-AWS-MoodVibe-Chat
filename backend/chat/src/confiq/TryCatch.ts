// Import TypeScript types from Express
// `type` keyword ensures these are only used for compile-time type checking
// and do not appear in the compiled JavaScript code.
import type { Request, Response, NextFunction, RequestHandler } from "express";

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
const tryCatch = (handler: RequestHandler): RequestHandler => {
  // Return a new async middleware function that Express can use
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Attempt to execute the original handler
      // `await` ensures we handle any async operations correctly
      await handler(req, res, next);
    } catch (error) {
      // If any error occurs in `handler`, it is caught here
      console.error("Error in tryCatch middleware:", error);

      // Respond to the client with a 500 Internal Server Error
      // This prevents unhandled promise rejections and keeps the server running
      res.status(500).json({ error: "Internal Server Error" });

      // Optional: could call `next(error)` instead if you have an error-handling middleware
      // next(error);
    }
  };
};

// Export tryCatch so it can wrap any route handler to auto-catch errors
export default tryCatch;
