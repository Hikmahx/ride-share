import express from "express";
import { body } from "express-validator";
import { verifyTokenAndAdmin } from "../middlewares/authMiddleware";
import { getUserById, registerUser } from "../controllers/userController";

const router = express.Router();

// @route   GET api/user/find/:id
// @desc    Get registered user by ID
// @access  Private (Admin)
router.get("/find/:id", verifyTokenAndAdmin, getUserById);

// @route   POST api/user
// @desc    Register user
// @access  Public
router.post(
  "/",
  body("firstname", "Please enter your first name").not().isEmpty(),
  body("lastname", "Please enter your last name").not().isEmpty(),
  body("email", "Please include a valid email").isEmail(),
  body("phone_number", "Please provide your phone number").not().isEmpty(),
  body(
    "password",
    "Please password shouldnt be less than 6 characters"
  ).isLength({ min: 6 }),
  registerUser
);

module.exports = router;
