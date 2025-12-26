import { connectToDatabase } from '../lib/mongoose';
import { hash } from 'bcryptjs';

async function initDatabase() {
  try {
    const { connection } = await connectToDatabase();
    const db = connection.db;
    
    // Create users collection
    await db.command({
      create: 'users',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'password', 'name', 'createdAt'],
          properties: {
            email: {
              bsonType: 'string',
              description: 'must be a string and is required',
              pattern: '^[^@\s]+@[^@\s]+\.[^@\s]+$',
            },
            password: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            name: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            image: {
              bsonType: 'string',
              description: 'optional profile image URL',
            },
            emailVerified: {
              bsonType: 'date',
              description: 'date when email was verified',
            },
            createdAt: {
              bsonType: 'date',
              description: 'date when user was created',
            },
            updatedAt: {
              bsonType: 'date',
              description: 'date when user was last updated',
            },
          },
        },
      },
    });

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    // Create watchlist collection
    await db.command({
      create: 'watchlist',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'symbol', 'createdAt'],
          properties: {
            userId: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            symbol: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            companyName: {
              bsonType: 'string',
              description: 'name of the company',
            },
            currentPrice: {
              bsonType: 'number',
              description: 'current price of the stock',
            },
            changePercent: {
              bsonType: 'number',
              description: 'price change percentage',
            },
            marketCap: {
              bsonType: 'string',
              description: 'market capitalization',
            },
            peRatio: {
              bsonType: 'string',
              description: 'price to earnings ratio',
            },
            createdAt: {
              bsonType: 'date',
              description: 'date when added to watchlist',
            },
          },
        },
      },
    });

    // Create indexes for watchlist
    await db.collection('watchlist').createIndex(
      { userId: 1, symbol: 1 },
      { unique: true }
    );

    // Create price_alerts collection
    await db.command({
      create: 'price_alerts',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'symbol', 'targetPrice', 'alertType', 'isActive', 'createdAt'],
          properties: {
            userId: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            symbol: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            targetPrice: {
              bsonType: 'number',
              description: 'target price for the alert',
              minimum: 0,
            },
            currentPrice: {
              bsonType: 'number',
              description: 'price when alert was created',
              minimum: 0,
            },
            alertType: {
              enum: ['ABOVE', 'BELOW'],
              description: 'alert when price goes above or below target',
            },
            isActive: {
              bsonType: 'bool',
              description: 'whether the alert is active',
            },
            isTriggered: {
              bsonType: 'bool',
              description: 'whether the alert has been triggered',
            },
            triggeredAt: {
              bsonType: 'date',
              description: 'when the alert was triggered',
            },
            createdAt: {
              bsonType: 'date',
              description: 'when the alert was created',
            },
            updatedAt: {
              bsonType: 'date',
              description: 'when the alert was last updated',
            },
          },
        },
      },
    });

    // Create indexes for price_alerts
    await db.collection('price_alerts').createIndex({ userId: 1 });
    await db.collection('price_alerts').createIndex(
      { symbol: 1, isActive: 1, isTriggered: 1 }
    );

    console.log('✅ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
