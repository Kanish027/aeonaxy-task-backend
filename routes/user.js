import express from "express";
import {
  createUser,
  editProfile,
  getUserProfile,
  logoutUser,
  purpose,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/new", createUser);

router.get("/user", isAuthenticated, getUserProfile);

router.put("/update", isAuthenticated, editProfile);

router.get("/logout", logoutUser);

router.post("/purpose", isAuthenticated, purpose);

export default router;
