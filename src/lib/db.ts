import mongoose from "mongoose";
import { env } from "@/config/envConfig";


let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return;

    if (!env.MONGO_URL) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(env.MONGO_URL, {
        dbName: "pharmaKhata",
    });



    isConnected = conn.connections?.[0]?.readyState === 1;
};
