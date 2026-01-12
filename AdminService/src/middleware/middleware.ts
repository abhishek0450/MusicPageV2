import axios from "axios";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        role: string;
    };
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided" });
            return;
        }

        // Fetch user details from authentication service
        const { data } = await axios.get(`${process.env.USER_URL}/api/v1/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("User Data from Auth Service:", data); // Debug log

        // ✅ Ensure `req.user` directly contains `_id` and `role`
        if (data && data.user) {
            req.user = {
                _id: data.user._id,
                role: data.user.role,
            };
        } else {
            console.error("Invalid user data format:", data);
            res.status(401).json({ message: "Unauthorized: Invalid user data" });
            return;
        }

        next();
    } catch (error) {
        console.error("Error in authentication middleware:", error);
        res.status(401).json({ message: "Unauthorized: Token verification failed" });
    }
};


//multer setup

import multer from "multer";

const storage = multer.memoryStorage();

const uploadFile = multer({ storage }).single("file");

export default uploadFile;