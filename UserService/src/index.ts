
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";
import userRoute from "./routes/route.js";

dotenv.config();

const app = express();
app.use(cors());
const port = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

connectDB();

app.use("/api/v1", userRoute);

app.get("/", (req, res) => {
    res.send(`User service is running at port ${port}!`);
});

app.listen(port, () => {
    console.log(`User service is running at port ${port}!`);
});
