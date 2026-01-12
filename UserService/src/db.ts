import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const mongoURI = process.env.MONGO_URI as string;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, { 
            dbName: "MusicPage",
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        console.log("MongoDB connected successfully");
        
        
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected');
        });
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        console.warn("⚠️  Running without database connection. Please check your MONGO_URI in .env");
        
    }
}

export default connectDB;