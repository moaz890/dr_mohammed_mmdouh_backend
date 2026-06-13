import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    // Fail fast if MONGO_URI is not set — better to crash at startup
    // than to get a cryptic error on the first DB call
    if (!env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const connection = await mongoose.connect(env.MONGO_URI);

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    // Exit the process so the server doesn't run in a broken state
    // A process manager (PM2, Docker) will restart it automatically
    process.exit(1);
  }
};
