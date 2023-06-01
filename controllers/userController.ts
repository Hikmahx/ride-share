import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config({ path: "../config/config.env" });

// @route    GET api/user/find/:id
// @desc     Get registered user by ID
// @access   Private (Admin)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json(user);
  } catch (err: any) {
    if (err.name === "CastError") {
      return res.status(400).json({ msg: "User doesn't exist" });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route    POST api/user
// @desc     Register user
// @access   Public
export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstname, lastname, email, password, phone_number } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).send("User already exists");
    }

    // CREATE A NEW USER
    user = new User({
      firstname,
      lastname,
      email,
      phone_number,
      password,
    });

    let salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        // only an admin can take CRUD operations to collections & delete any users
        // if not an admin, the user can only make CRUD operations to his/her account
      },
    };
    jwt.sign(
      payload,
      process.env.JWTSECRET as string,
      {
        expiresIn: 360000,
      },
      (error, token) => {
        if (error) throw error;
        res.json({ token });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
