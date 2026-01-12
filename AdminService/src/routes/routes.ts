import express from "express";
import uploadFile, { isAuth } from "../middleware/middleware.js";
import {addAlbums , addSongs, addThumbnail, deleteAlbum, deleteSong}  from "../controller/controller.js";

const router = express.Router();


router.post("/album/new", isAuth, uploadFile, addAlbums); // Add a new album
router.post("/song/new", isAuth, uploadFile, addSongs); // Add a new song
router.post("/song/:id", isAuth, uploadFile, addThumbnail); // Add Thumbnail to song
router.delete("/album/:id",isAuth, deleteAlbum);
router.delete("/song/:id",isAuth, deleteSong);

export default router;