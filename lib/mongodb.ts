import mongoose from "mongoose";

// Define the MongoDB connection object type
type MongooseConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend the global object to include mongoose connection caching
declare global {
  var mongoose: MongooseConnection | undefined;
}

// Retrieve MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Validate that the MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Initialize the cached connection object
let cached: MongooseConnection = global.mongoose || {
  conn: null,
  promise: null,
};

// Store the cached connection in the global object to persist across module reloads
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Implements connection caching to reuse existing connections and prevent
 * multiple connections in serverless environments (e.g., Next.js API routes).
 *
 * @returns A promise that resolves to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return the existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // Create a new connection promise if one doesn't exist
  if (!cached.promise) {
    const options = {
      bufferCommands: false, // Disable Mongoose buffering to prevent issues in serverless environments
    };

    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      return mongoose;
    });
  }

  // Wait for the connection promise to resolve and cache the connection
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset the promise on error to allow retry
    throw error;
  }

  return cached.conn;
}

export default connectDB;
