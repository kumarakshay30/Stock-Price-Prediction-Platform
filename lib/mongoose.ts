import { MongoClient, type MongoClientOptions, type Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB = process.env.MONGODB_DB || 'stocks_app';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

interface MongoCache {
  conn: MongoConnection | null;
  promise: Promise<MongoConnection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongo: MongoCache;
}

let cached: MongoCache = global.mongo || { conn: null, promise: null };

if (!global.mongo) {
  global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: MongoClientOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    try {
      cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
        return {
          client,
          db: client.db(MONGODB_DB),
        };
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw new Error('Failed to connect to MongoDB');
    }
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connected successfully');
    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cached.promise = null;
    throw new Error('Failed to connect to MongoDB');
  }
}

// Helper function to get database collections
export async function getCollection<T extends Document = Document>(collectionName: string) {
  const { db } = await connectToDatabase();
  return db.collection<T>(collectionName);
}

export const db = {
  users: () => getCollection('users'),
  watchlist: () => getCollection('watchlist'),
  priceAlerts: () => getCollection('price_alerts'),
};
