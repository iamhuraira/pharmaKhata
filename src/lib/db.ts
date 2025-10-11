import mongoose from "mongoose";
import { env } from "@/config/envConfig";

// Global promise to ensure single connection
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
        console.log('✅ Database already connected');
        return;
    }

    if (!env.MONGO_URL) {
        throw new Error("MONGO_URL is not defined in environment variables");
    }

    // Return existing connection if available
    if (cached.conn) {
        console.log('✅ Using cached database connection');
        return cached.conn;
    }

    // Create new connection if no promise exists
    if (!cached.promise) {
        console.log('🔌 Creating new MongoDB connection...');
        
        const opts = {
            bufferCommands: false, // Disable mongoose buffering
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000, // Reduced for Vercel
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000, // Reduced for Vercel
            family: 4, // Use IPv4, skip trying IPv6
            retryWrites: true,
            w: 'majority'
        };

        cached.promise = mongoose.connect(env.MONGO_URL, opts).then((mongoose) => {
            console.log('✅ Database connected successfully');
            return mongoose;
        }).catch((error) => {
            console.error('❌ Database connection failed:', error);
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};
