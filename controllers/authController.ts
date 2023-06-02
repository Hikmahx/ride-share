import { Request, Response } from "express";
import { body, validationResult, Result } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";

dotenv.config({ path: "../config/config.env" });

interface AuthRequest extends Request {
  user?: IUser;
}

// @ route    GET api/auth
// @desc      Get logged in user
// @ access   Private
export const getLoggedInUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      return res.status(400).json({ msg: "User doesn't exist" });
    }
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @ route    POST api/auth
// @ desc     authenticate (Login) user & get token
// @ access   Public
export const authenticateUser = async (req: AuthRequest, res: Response) => {
  const errors: Result = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Email is invalid" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Password is invalid" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      {
        expiresIn: 360000,
      },
      (error, token) => {
        if (error) throw error;
        const { password, ...others } = user._doc;
        res.json({
          token,
          user: { ...others },
        });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @ route    PUT api/auth/:id
// @desc      Update user
// @ access   Private
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { password, currentPassword, ...others } = req.body;
    const user = await User.findById(req.params.id);

    let newPassword;

    if (!user) {
      return res.status(400).json({ msg: "User doesn't exist" });
    }
    // CHECK IF THE USER WANTS TO UPDATE THEIR PASSWORD
    if (req.body.password && user != null) {
      // IF CURRENT PASSWORD ISN'T GIVEN
      if (!req.body.currentPassword) {
        return res.status(400).json({
          msg: "Provide your current password before you can update your password",
        });
      }
      let salt = await bcrypt.genSalt(10);
      newPassword = await bcrypt.hash(req.body.password, salt);
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Old password isn't correct" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      {
        $set: {
          ...others,
          password: newPassword,
        },
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err: any) {
    if (err.name == "CastError") {
      return res.status(400).json({ msg: "User doesn't exist" });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @ route    DELETE api/auth/:id
// @ desc     Delete user
// @ access   Private
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user: IUser | null = await User.findByIdAndDelete(req.user?.id);
    if (!user) {
      return res.status(400).json({ msg: "User doesn't exist" });
    }
    res.status(200).json({ msg: "User is successfully deleted" });
  } catch (err: any) {
    if (err.name == "CastError") {
      return res.status(400).json({ msg: "User doesn't exist" });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
