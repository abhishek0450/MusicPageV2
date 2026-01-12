
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import redis from "redis";
import { sql } from "./config/db.js";
import adminRoutes from "./routes/routes.js";
import cloudinary from "cloudinary";

dotenv.config();

const PORT = process.env.PORT || 7000;

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, 
});

//  Redis client
export const redisClient = redis.createClient({
  password: process.env.Redis_Password,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient
.connect()
.then(() => console.log("Connected to Redis"))
.catch((error) => {
  console.warn(" Redis connection failed (running without cache):", error.message);
});

// Prevent app crash on Redis errors
redisClient.on('error', (err) => {
  console.warn(' Redis Client Error:', err.message);
});

redisClient.on('reconnecting', () => {
  console.log(' Reconnecting to Redis...');
});

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1",adminRoutes)

// Create tables in the database if they do not exist
async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS albums(
      id SERIAL PRIMARY KEY,
      title VARCHAR(225) NOT NULL,
      description VARCHAR(225) NOT NULL,
      thumbnail VARCHAR(225) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    await sql`CREATE TABLE IF NOT EXISTS songs(
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      thumbnail VARCHAR(255), 
      audio VARCHAR(255) NOT NULL,
      album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing the database:", error);
  }
}

// Ensure DB is initialized before starting the server
(async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
