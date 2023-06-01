import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../config/config.env" });

interface User {
  id: string;
  role: boolean;
}

interface AuthRequest extends Request {
  user?: JwtPayload | User;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (typeof decoded === "string") {
      throw new Error("Invalid token");
    }
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Token is not valid" });
  }
};

// TO CHECK IF THE USER/ ADMIN IS THE ONE MAKING THE REQUEST
export const verifyTokenAndUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  verifyToken(req, res, () => {
    if (req.user?.id === req.body.user || req.user?.role !== "admin") {
      next();
    } else {
      res.status(403).json({ message: "You're not allowed to do that!" });
    }
  });
};

// VERIFY IF THE USER IS AN ADMIN
export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  verifyToken(req, res, () => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  });
};
