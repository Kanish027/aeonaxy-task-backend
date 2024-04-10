import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";

// Middleware to check if the user is authenticated.
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  // If no token is found in cookies, return unauthorized status and message
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Login to continue",
    });
  }

  // Verify the JWT token and decode it
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // Find the user associated with the decoded ID and attach it to the request object
  req.user = await User.findById(decoded._id);
  next();
};

export { isAuthenticated };
