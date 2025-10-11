import mongoose from "mongoose";
import { env } from "@/config/envConfig";

// Global promise to ensure single connection
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
    if (!env.MONGO_URL) {
        throw new Error("MONGO_URL is not defined in environment variables");
    }

    // Return existing connection if available
    if (cached.conn) {
        console.log('✅ Using cached database connection');
        return cached.conn;
    }

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
        console.log('✅ Database already connected');
        cached.conn = mongoose.connection;
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
            w: 'majority' as const
        };

        cached.promise = mongoose.connect(env.MONGO_URL, opts).then((connection) => {
            console.log('✅ Database connected successfully');
            return connection;
        }).catch((error) => {
            console.error('❌ Database connection failed:', error);
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
        
        // Set up connection event handlers
        mongoose.connection.on('error', (error) => {
            console.error('❌ Database connection error:', error);
            cached.conn = null;
            cached.promise = null;
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ Database disconnected');
            cached.conn = null;
            cached.promise = null;
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 Database reconnected');
            cached.conn = mongoose.connection;
        });
        
    } catch (e) {
        cached.promise = null;
        cached.conn = null;
        throw e;
    }

    return cached.conn;
};
