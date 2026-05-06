import mongoose from 'mongoose';
import { env } from './env';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalCache = globalThis as typeof globalThis & {
  __mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalCache.__mongooseCache ?? { conn: null, promise: null };
globalCache.__mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    mongoose.set('strictQuery', true);
    cache.promise = mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      bufferCommands: false,
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
