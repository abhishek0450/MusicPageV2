import { Request, Response } from 'express';
import cloudinary from 'cloudinary';
import { sql } from '../config/db.js';
import getBuffer from '../config/dataURI.js';
import { redisClient } from '../index.js';

interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        role: string;
    }
}

export const addAlbums = async (req: AuthenticatedRequest, res: Response) : Promise<void> => {
    try {
        console.log("=== ADD ALBUM REQUEST ===");
        console.log("User:", req.user);
        console.log("Body:", req.body);
        
        if(req.user?.role !== "admin"){
            console.log("Authorization failed: User role is", req.user?.role);
            res.status(403).json({ message: "Access denied. Admin role required." });
            return;
        }

        const { title, description } = req.body;
        
        if (!title || !description) {
            res.status(400).json({ message: "Title and description are required" });
            return;
        }
        
        const file = req.file;
        if (!file) {
            res.status(400).json({ message: "Album thumbnail image is required" });
            return;
        }
        
        const fileBuffer = getBuffer(file);

        if(!fileBuffer || !fileBuffer.content) {
            res.status(500).json({ message: "Failed to process image file" });
            return;
        }

        console.log("Uploading album thumbnail to Cloudinary...");
        const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
            folder: 'album',
            resource_type: 'image',
        });
        console.log("Upload successful:", cloud.secure_url);

        const result = await sql`
        INSERT INTO albums (title, description, thumbnail) VALUES (${title}, ${description}, ${cloud.secure_url}) RETURNING *
        `;

        if(redisClient.isReady){
          await redisClient.del("albums");
          console.log("Cache invalidated for albums");
        }

        res.status(201).json({
            message: "Album created successfully",
            album: result[0],
          });
        
    } catch (error: any) {
        console.error("Add album error:", error);
        res.status(500).json({ 
            message: "Failed to create album",
            error: error.message 
        });
    }};

    export const addSongs = async (req :AuthenticatedRequest, res: Response) : Promise<void> => {
        try {
            console.log("=== ADD SONG REQUEST ===");
            console.log("User:", req.user);
            console.log("Body:", req.body);
            console.log("File:", req.file ? "File received" : "No file");
            
            if (req.user?.role !== "admin") {
                console.log("Authorization failed: User role is", req.user?.role);
                res.status(401).json({
                  message: "You are not admin",
                });
                return;
              }
            
              const { title, description, album } = req.body;
            
              const isAlbum = await sql`SELECT * FROM albums WHERE id = ${album}`;
            
              if (isAlbum.length === 0) {
                res.status(404).json({
                  message: "No album with this id",
                });
                return;
              }
            
              const file = req.file;
            
              if (!file) {
                res.status(400).json({
                  message: "No file to upload",
                });
                return;
              }
            
              const fileBuffer = getBuffer(file);
            
              if (!fileBuffer || !fileBuffer.content) {
                res.status(500).json({
                  message: "Failed to generate file buffer",
                });
                return;
              }
            
              console.log("Uploading to Cloudinary...");
              const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
                folder: "songs",
                resource_type: "video",
                timeout: 120000, // 2 minutes for large audio files
                chunk_size: 6000000, // 6MB chunks
              });
              console.log("Upload successful:", cloud.secure_url);
            
              const result = await sql`
                INSERT INTO songs (title, description, audio, album_id) VALUES
                (${title}, ${description}, ${cloud.secure_url}, ${album})
              `;

              if(redisClient.isReady){
                await redisClient.del("songs"); // Delete the cache for songss
                console.log("Cache deleted for songs");
              
              }
      
            
              res.json({
                message: "Song Added",
              });
        
            
        } catch (error: any) {
          console.error("Add song error:", error);
          res.status(500).json({ 
              message: "Failed to add song",
              error: error.message || "Upload failed. File may be too large or invalid."
          });
        }
    };

    export const addThumbnail = async (req :AuthenticatedRequest, res: Response) : Promise<void> => {
        try {
            console.log("=== ADD THUMBNAIL REQUEST ===");
            console.log("User:", req.user);
            console.log("Song ID:", req.params.id);
            console.log("File:", req.file ? "File received" : "No file");
            
            if (req.user?.role !== "admin") {
                console.log("Authorization failed: User role is", req.user?.role);
                res.status(401).json({
                  message: "You are not admin",
                });
                return;
              }
            
              const song = await sql`SELECT * FROM songs WHERE id = ${req.params.id}`;
            
              if (song.length === 0) {
                res.status(404).json({
                  message: "No song with this id",
                });
                return;
              }
            
              const file = req.file;
            
              if (!file) {
                res.status(400).json({
                  message: "No file to upload",
                });
                return;
              }
            
              const fileBuffer = getBuffer(file);
            
              if (!fileBuffer || !fileBuffer.content) {
                res.status(500).json({
                  message: "Failed to process image file",
                });
                return;
              }
            
              console.log("Uploading thumbnail to Cloudinary...");
              const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
                folder: 'song-thumbnails',
                resource_type: 'image',
              });
              console.log("Thumbnail upload successful:", cloud.secure_url);
            
              const result = await sql`
                UPDATE songs SET thumbnail = ${cloud.secure_url} WHERE id = ${req.params.id} RETURNING *
              `;

              if(redisClient.isReady){
                await redisClient.del("songs"); // Delete the cache of songs
                console.log("Cache deleted for songs");
              
              }
          
              res.json({
                message: "Thumbnail added successfully",
                song: result[0],
              });
            
        } catch (error: any) {
          console.error("Add thumbnail error:", error);
          res.status(500).json({ 
              message: "Failed to add thumbnail",
              error: error.message 
          });
        }
    };
 
 export const deleteAlbum = async (req : AuthenticatedRequest, res: Response) : Promise<void> => {
        try {
            if(req.user?.role !== "admin"){
                res.status(403).json({message:"You need to be an Artist"});
            }
            const { id } = req.params;
            
            const isAlbum = await sql`SELECT * FROM albums WHERE id = ${id}`;
            if (isAlbum.length === 0) {
                res.status(404).json({
                  message: "No album with this id",
                });
                return;
              }
        
              await sql`DELETE FROM songs WHERE album_id = ${id}`;
        
              await sql`DELETE FROM albums WHERE id = ${id}`;

              if (redisClient.isReady) {
                await redisClient.del("albums");
                console.log("Cache invalidated for albums");
              }
            
              if (redisClient.isReady) {
                await redisClient.del("songs");
                console.log("Cache invalidated for songs");
              }
        
              res.json({
                message: "Album deleted successfully",
              });
        } catch (error) {
          console.error("error:", error);
            res.status(403).json({message : "You need to be an Artist."})
        }
 }

 export const deleteSong = async (req : AuthenticatedRequest, res: Response) : Promise<void> => {
    try {
        if (req.user?.role !== "admin") {
            res.status(401).json({
              message: "You are not admin",
            });
            return;
          }
        
          const { id } = req.params;
        
          const song = await sql`SELECT * FROM songs WHERE id = ${id}`;
        
          if (song.length === 0) {
            res.status(404).json({
              message: "No song with this id",
            });
            return;
          }
        
          await sql`DELETE FROM  songs WHERE id = ${id}`;

          if (redisClient.isReady) {
            await redisClient.del("songs");
            console.log("Cache invalidated for songs");
          }

          res.json({
            message: "Song deleted successfully",
          });
    } catch (error) {
      console.error("error:", error);
        res.status(403).json({message : "You need to be an Artist."})
    }
 }