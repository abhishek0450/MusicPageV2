import express from "express";
import {loginUser,myProfile,registerUser, addToPlaylist} from "../controllers/controller.js";
import { isAuth } from "../middleware/middleware.js";

const router = express.Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/user/me" , isAuth, myProfile);
router.post("/song/:id", isAuth, addToPlaylist);

export default router;
