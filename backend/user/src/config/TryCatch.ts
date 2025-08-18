import type { Request, Response, NextFunction, RequestHandler } from "express"; 
// Importing TypeScript types from express.
// The `type` keyword is used because these exist only at compile-time 
// and are removed from the final JavaScript code.

const tryCatch = (handler: RequestHandler): RequestHandler => { 
  // Declare a function `tryCatch` that takes one argument:
  // - `handler`: must be of type RequestHandler (an Express middleware/route function).
  // The function itself also returns a RequestHandler.
  
  return async (req: Request, res: Response, next: NextFunction) => { 
    // Return a new async function with Express's standard parameters:
    // req (Request), res (Response), and next (NextFunction).
    // Using `async` allows the use of `await` inside.

    try {
      await handler(req, res, next); 
      // Try to run the original handler.
      // `await` ensures we wait for async tasks (like DB calls) to finish.
    } catch (error) {
      // If an error occurs anywhere above, execution jumps here.

      console.error("Error in tryCatch middleware:", error); 
      // Log the error on the server for debugging.

      res.status(500).json({ error: "Internal Server Error" }); 
      // Send a 500 response to the client indicating a server error.
    }
  };
};

export default tryCatch; 
// Export `tryCatch` so it can be imported and used 
// to wrap route handlers in other files.
