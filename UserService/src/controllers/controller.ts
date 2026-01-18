import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {User}from "../models/userModel.js";
import { AuthenticatedRequest } from "../middleware/middleware.js";


//register user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });

        if (user) {
            res.status(400).json({ message: "User already exists" });

            return; 
        }
        const salt : string = await bcrypt.genSalt(10);
        const hashPassword : string = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashPassword,
        })


        const token = jwt.sign(
            { 
                userId: user._id.toString(), 
                role: user.role,
                email: user.email 
            }, 
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );
        
        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            token,
            user,
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

//login user
export const loginUser = async (req: Request, res : Response): Promise<void> => {
    try {

        const { email, password } = req.body;
        
        if(!email || !password) {
            res.status(400).json({ message: "Please enter all fields" });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        const token = jwt.sign(
            { 
                userId: user._id.toString(), 
                role: user.role,
                email: user.email 
            }, 
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );
        

        res.status(201).json({
            message: "User Login successfully",
            token,
            user,
        });

    }
    catch(error : any) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const myProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try{
        const user = req.user;
        if(!user){
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        res.status(200).json({
            message: "User Profile",
            user,
        });
    }
    catch(error : any) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Add or remove song from playlist
export const addToPlaylist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const songId = req.params.id;
        
        // Check if song is already in playlist
        const songIndex = user.playlist.indexOf(songId);
        
        if (songIndex === -1) {
            // Add to playlist
            user.playlist.push(songId);
            await user.save();
            res.status(200).json({
                message: "Song added to playlist",
                playlist: user.playlist,
            });
        } else {
            // Remove from playlist
            user.playlist.splice(songIndex, 1);
            await user.save();
            res.status(200).json({
                message: "Song removed from playlist",
                playlist: user.playlist,
            });
        }
    } catch (error: any) {
        console.error("Add to playlist error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
