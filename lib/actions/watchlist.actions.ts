'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { auth } from '../better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getStocksDetails } from './finnhub.actions';

// Clear all items from the user's watchlist
export async function clearWatchlist(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    await connectToDatabase();
    
    // Delete all watchlist items for the current user
    const result = await Watchlist.deleteMany({ userId: session.user.id });
    
    // Revalidate the watchlist page to reflect changes
    revalidatePath('/watchlist');
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error clearing watchlist:', error);
    throw new Error('Failed to clear watchlist');
  }
}

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

// Add stock to watchlist
export const addToWatchlist = async (symbol: string, company: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();
    
    // Check if stock already exists in watchlist
    const existingItem = await Watchlist.findOne({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
    });

    if (existingItem) {
      return { success: false, error: 'Stock already in watchlist' };
    }

    // Add to watchlist
    const newItem = new Watchlist({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
      company: company.trim(),
      addedAt: new Date(),
    });

    await newItem.save();
    revalidatePath('/watchlist');

    return { success: true, message: 'Stock added to watchlist' };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw new Error('Failed to add stock to watchlist');
  }
};

// Remove stock from watchlist
export const removeFromWatchlist = async (symbol: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();
    
    // Remove from watchlist
    await Watchlist.deleteOne({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
    });
    
    revalidatePath('/watchlist');

    return { success: true, message: 'Stock removed from watchlist' };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw new Error('Failed to remove stock from watchlist');
  }
};

// Get user's watchlist with stock data
export const getWatchlistWithData = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();
    
    const watchlist = await Watchlist.find({ userId: session.user.id })
      .sort({ addedAt: -1 })
      .lean();

    if (watchlist.length === 0) return [];

    const stocksWithData = await Promise.all(
      watchlist.map(async (item) => {
        try {
          const stockData = await getStocksDetails(item.symbol);
          
          if (!stockData) {
            console.warn(`Failed to fetch data for ${item.symbol}`);
            return {
              ...item,
              currentPrice: 0,
              priceFormatted: 'N/A',
              changeFormatted: 'N/A',
              changePercent: 0,
              marketCap: 'N/A',
              peRatio: 'N/A',
            };
          }

          return {
            ...item,
            company: stockData.company || item.company,
            currentPrice: stockData.currentPrice || 0,
            priceFormatted: stockData.priceFormatted || 'N/A',
            changeFormatted: stockData.changeFormatted || '0 (0%)',
            changePercent: stockData.changePercent || 0,
            marketCap: stockData.marketCapFormatted || 'N/A',
            peRatio: stockData.peRatio || 'N/A',
          };
        } catch (error) {
          console.error(`Error fetching details for ${item.symbol}:`, error);
          return {
            ...item,
            currentPrice: 0,
            priceFormatted: 'Error',
            changeFormatted: 'Error',
            changePercent: 0,
            marketCap: 'Error',
            peRatio: 'Error',
          };
        }
      })
    );

    return JSON.parse(JSON.stringify(stocksWithData));
  } catch (error) {
    console.error('Error loading watchlist:', error);
    throw new Error('Failed to fetch watchlist');
  }
};

// Get user's watchlist (basic info only)
export const getUserWatchlist = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();
    
    const watchlist = await Watchlist.find({ userId: session.user.id })
      .sort({ addedAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(watchlist));
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    throw new Error('Failed to fetch watchlist');
  }
};
