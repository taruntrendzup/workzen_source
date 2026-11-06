
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        'MONGODB_URI is missing! Please configure it in Render Environment Variables.'
      );
    }

    console.log('[MongoDB] Connecting to configured database...');

    const conn = await mongoose.connect(mongoURI);

    console.log(
      `[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`
    );

  } catch (error) {
    console.error('[MongoDB] Connection Error:', error.message);
    process.exit(1);
  }
};
