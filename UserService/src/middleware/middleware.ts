import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser, User } from "../models/userModel.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader); // Debugging

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    // Get token after "Bearer "
    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token); // Debugging

    // Verify token
    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    console.log("Decoded JWT:", decodedValue); // Debugging

    if (!decodedValue || (!decodedValue._id && !decodedValue.id)) {
      res.status(403).json({ message: "Invalid Token" });
      return;
    }

    // Get User ID from token
    const userId = decodedValue.id || decodedValue._id;
    console.log("Extracted User ID:", userId); // Debugging

    // Find user in database
    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(403).json({ message: "User Not Found" });
      return;
    }

    // Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error); // Debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(401).json({ message: "Unauthorized: Invalid token", error: errorMessage });
  }
};
