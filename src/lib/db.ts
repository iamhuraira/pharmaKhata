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
        throw new Error("MONGO_URL is not defined in environment variables");
    }

    try {
        console.log('🔌 Connecting to MongoDB...');
        
        // Improved connection options with longer timeouts and better error handling
        const conn = await mongoose.connect(env.MONGO_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000, // Increased from 5000ms to 30000ms
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000, // Added connection timeout
            family: 4, // Use IPv4, skip trying IPv6
            retryWrites: true,
            w: 'majority'
        });

        isConnected = conn.connections?.[0]?.readyState === 1;
        console.log('✅ Database connected successfully');
        
        // Set up connection event handlers
        mongoose.connection.on('error', (error) => {
            console.error('❌ Database connection error:', error);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ Database disconnected');
            isConnected = false;
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 Database reconnected');
            isConnected = true;
        });
        
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        
        // Provide more helpful error messages
        if (error instanceof Error) {
            if (error.message.includes('ENOTFOUND')) {
                console.error('💡 Possible solutions:');
                console.error('   1. Check your internet connection');
                console.error('   2. Verify MongoDB Atlas cluster is running');
                console.error('   3. Check IP whitelist in MongoDB Atlas');
                console.error('   4. Verify the connection string is correct');
            } else if (error.message.includes('authentication')) {
                console.error('💡 Authentication failed - check username/password in connection string');
            } else if (error.message.includes('timeout')) {
                console.error('💡 Connection timeout - cluster might be paused or slow');
            }
        }
        
        throw error;
    }
};
