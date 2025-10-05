import express from "express";
import { getUser, updateName, loginUser, myprofile, getallUsers } from "../controllers/user.js";
import { verifyOtp } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";
import { get } from "mongoose";


 
// Create a new router instance from Express.
// This is like creating a mini-app that can handle specific routes.
const router = express.Router();

// Define a POST route for user login.
// When a client sends a POST request to '/login', the 'loginUser' function
// from the user controller will be executed.
// This route is typically for sending a phone number or email to start the login process.
router.post("/login", loginUser);
 
// Define a POST route for OTP verification.
// When a client sends a POST request to '/verify', the 'verifyOtp' function
// from the user controller will be executed.
// This route is for the user to submit the OTP they received to complete the login.
router.post("/verify", verifyOtp);

// Export the router so it can be used in your main Express app file (e.g., app.js or index.js).
// This is what makes these routes available to your entire application.

router.post("/update/user", isAuth, updateName);

router.get("/me", isAuth, myprofile);
router.get("/user/all", isAuth, getallUsers)
router.get("/user/:id", getUser);



export default router;
