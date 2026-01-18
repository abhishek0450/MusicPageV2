import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        role: string;
        email?: string;
    };
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided" });
            return;
        }

        // Verify token locally - NO external API call
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: string;
            role: string;
            email?: string;
        };

        // Attach user info to request from JWT payload
        req.user = {
            _id: decoded.userId,
            role: decoded.role,
            email: decoded.email,
        };

        console.log("User authenticated from JWT:", req.user); // Debug log

        next();
    } catch (error) {
        console.error("Error in authentication middleware:", error);
        res.status(401).json({ message: "Unauthorized: Token verification failed" });
    }
};

// Middleware to check if user is admin
export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== "admin") {
        res.status(403).json({ message: "Forbidden: Admin access required" });
        return;
    }
    next();
};


//multer setup

import multer from "multer";

const storage = multer.memoryStorage();

const uploadFile = multer({ storage }).single("file");

export default uploadFile;