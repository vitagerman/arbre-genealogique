import mongoose from "mongoose";

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  const MONGODB_URI = process.env.MONGO_URI!; // ← déplacé ici

  if (!MONGODB_URI) {
    throw new Error("Veuillez définir MONGO_URI dans .env.local");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: "meteoDB" });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}