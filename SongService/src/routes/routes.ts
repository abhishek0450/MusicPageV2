import express from "express"
import { getAllAlbums, getAllSongs, getAllSongsOfAlbum, getSingleSong } from "../controller/controller.js";

const route = express.Router();

route.get("/album/all", getAllAlbums);
route.get("/song/all", getAllSongs);
route.get("/album/:id", getAllSongsOfAlbum);
route.get("/song/:id", getSingleSong);

export default route;