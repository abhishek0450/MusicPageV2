import { Request, Response } from "express";
import { sql } from "../config/db.js";
import { redisClient } from "../index.js";

export const getAllAlbums = async (req: Request, res: Response) : Promise<void> => {
    try {
        let albums;
        const CACHE_EXPIRY = 1800;
      
        if (redisClient.isReady) {
          albums = await redisClient.get("albums");
        }
      
        if (albums) {
          console.log("Cache hit");
          res.json(JSON.parse(albums));
          return;
        } else {
          console.log("Cache miss");
          albums = await sql`SELECT * FROM albums`;
      
          if (redisClient.isReady) {
            await redisClient.set("albums", JSON.stringify(albums), {
              EX: CACHE_EXPIRY,
            });
          }
          res.json(albums);
          return;
        }
    } catch (error) {
        console.error("Error fetching albums:", error);
        res.status(500).json({ error: "Error fetchings albums" });
        
    }
}

export const getAllSongs = async (req: Request, res: Response) : Promise<void> => {
    try {
        let songs;
        const CACHE_EXPIRY = 1800;
        if( redisClient.isReady) {
            songs = await redisClient.get("songs");
        }
        if (songs) {
            console.log("Cache hit");
            res.json(JSON.parse(songs));
            return;
        } else {
            console.log("Cache miss");
            songs = await sql`SELECT * FROM songs`;
            if (redisClient.isReady) {
                await redisClient.set("songs", JSON.stringify(songs), {
                    EX: CACHE_EXPIRY,
                });
            }
            res.json(songs);
            return;
        }
       
    } catch (error) {
        
        res.status(500).json({ error: "Error fetchings songs" });
        
    }
}

export const getAllSongsOfAlbum = async (req: Request, res: Response) : Promise<void> => {
    try {
        const {id} = req.params;
        let album, songs;
        const CACHE_EXPIRY = 1800;
        if(redisClient.isReady) {
            album = await redisClient.get(`album:${id}`);
            songs = await redisClient.get(`songs:${id}`);
        }
        if (album && songs) {
            console.log("Cache hit");
            res.json({ album: JSON.parse(album), songs: JSON.parse(songs) });
            return;
        }
        else {
            console.log("Cache miss");
            album = await sql`SELECT * FROM albums WHERE id = ${id}`;
            if (album.length === 0) {
                res.status(404).json({
                    message: "No album with this id",
                });
                return;
            }
            songs = await sql` SELECT * FROM songs WHERE album_id = ${id}`;
            if (redisClient.isReady) {
                await redisClient.set(`album:${id}`, JSON.stringify(album[0]), {
                    EX: CACHE_EXPIRY,
                });
                await redisClient.set(`songs:${id}`, JSON.stringify(songs), {
                    EX: CACHE_EXPIRY,
                });
            }
            const response = { songs, album: album[0] };
            res.json(response);
            return;
        }

    } catch (error) {
        
        res.status(500).json({ error: "Error fetchings songs" });
        
    }
}


export const getSingleSong = async (req : Request, res: Response) => {
   try {
    const song = await sql`SELECT * FROM songs WHERE id = ${req.params.id}`;
  
    res.json(song[0]);
   } catch (error) {
    res.status(500).json({ error: "Error fetching song" });
    
   }
  }