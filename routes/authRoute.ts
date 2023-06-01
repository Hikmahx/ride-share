import express from "express";
import { body } from "express-validator";
import {
  authenticateUser,
  deleteUser,
  getLoggedInUser,
  updateUser,
} from "../controllers/authController";
import { verifyToken, verifyTokenAndUser } from "../middlewares/authMiddleware";

const router = express.Router();

// GET LOGGED IN USER
router.get("/", verifyToken, getLoggedInUser);

// AUTHENTICATE USER AND GET TOKEN
router.post(
  "/",
  body("email", "Please include a valid email").isEmail(),
  body("password", "Password is required").exists(),
  authenticateUser
);

// UPDATE USER
router.put("/:id", verifyTokenAndUser, updateUser);

// DELETE USER
router.delete("/:id", verifyTokenAndUser, deleteUser);
