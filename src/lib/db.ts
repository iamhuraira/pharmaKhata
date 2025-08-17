import mongoose from "mongoose";
import { env } from "@/config/envConfig";

let isConnected = false;

export const connectDB = async () => {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
        console.log('✅ Database already connected');
        return;
    }

    if (!env.MONGO_URL) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }

    try {
        // Use the exact same connection logic that works in the seeder
        const conn = await mongoose.connect(env.MONGO_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = conn.connections?.[0]?.readyState === 1;
        console.log("Connected", isConnected ? "successfully" : "unsuccessfully");
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};
