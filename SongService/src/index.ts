import express, { Router } from "express";
import dotenv from "dotenv";
import cors from "cors";
import redis from "redis";
import songRoutes from "./routes/routes.js"
dotenv.config();

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
    console.warn("Redis connection failed (running without cache):", error.message);
  });

  // Prevent app crash on Redis errors
  redisClient.on('error', (err) => {
    console.warn('Redis Client Error:', err.message);
  });

  redisClient.on('reconnecting', () => {
    console.log(' Reconnecting to Redis...');
  });


const app = express();
app.use(cors());
app.use("/api/v1",songRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, ()=>{
    console.log(`Server is running on Port ${PORT}`);
})