'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';
import { cache } from 'react';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Try both environment variable names with debug logging
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || process.env.FINNHUB_API_KEY || '';

// Debug log to help diagnose environment variable issues
console.log('Environment Variables:', {
  hasNextPublic: !!process.env.NEXT_PUBLIC_FINNHUB_API_KEY,
  hasRegular: !!process.env.FINNHUB_API_KEY,
  nodeEnv: process.env.NODE_ENV,
  // Don't log the actual API key for security
  hasAnyKey: !!(process.env.NEXT_PUBLIC_FINNHUB_API_KEY || process.env.FINNHUB_API_KEY)
});

interface RawNewsArticle {
  id: number;
  headline: string;
  summary: string;
  url: string;
  image: string;
  datetime: number;
  source: string;
}

interface MarketNewsArticle {
  id: number;
  title: string;
  summary: string;
  url: string;
  image: string;
  datetime: number;
  source: string;
  symbol?: string;
}

interface StockWithWatchlistStatus {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  isInWatchlist: boolean;
}

const MAX_RETRIES = 3;
const INITIAL_TIMEOUT_MS = 15000; // 15 seconds

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async <T>(
  url: string,
  revalidateSeconds?: number,
  attempt = 1,
  lastError?: Error
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), INITIAL_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: revalidateSeconds },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Don't retry on 4xx errors (except 429 - Too Many Requests)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (attempt < MAX_RETRIES) {
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delayMs = 1000 * Math.pow(2, attempt - 1);
      console.warn(`Attempt ${attempt} failed for ${url}. Retrying in ${delayMs}ms...`, errorMessage);
      await delay(delayMs);
      return fetchWithRetry<T>(url, revalidateSeconds, attempt + 1, error as Error);
    }

    // Max retries reached, throw the last error
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error(`Request timed out after ${MAX_RETRIES} attempts:`, url);
        throw new Error('Request took too long to complete. Please try again later.');
      }
      if (error instanceof TypeError) {
        console.error('Network error after retries:', error.message);
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
    }
    
    console.error(`Failed to fetch data after ${MAX_RETRIES} attempts:`, error);
    throw lastError || new Error('Failed to fetch data. Please try again later.');
  }
};

const fetchJSON = async <T>(
  url: string,
  revalidateSeconds?: number
): Promise<T> => {
  return fetchWithRetry<T>(url, revalidateSeconds);
};

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
  try {
    const token = FINNHUB_API_KEY;
    if (!token) {
      console.error('FINNHUB API key is not configured. Please check your .env.local file and ensure it contains NEXT_PUBLIC_FINNHUB_API_KEY or FINNHUB_API_KEY');
      console.error('Current environment:', process.env.NODE_ENV);
      return [];
    }

    const trimmed = query?.trim() || '';
    
    if (!trimmed) {
      // Return popular stocks if no query
      try {
        const symbols = POPULAR_STOCK_SYMBOLS.slice(0, 10);
        const profilePromises = symbols.map(symbol => 
          fetchJSON<any>(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${token}`, 3600)
            .then(profile => ({
              symbol,
              name: profile?.name || symbol,
              exchange: profile?.exchange || 'US',
              type: profile?.finnhubIndustry ? 'Stock' : 'Crypto',
              isInWatchlist: false
            }))
            .catch(() => null)
        );

        const profiles = await Promise.all(profilePromises);
        return profiles.filter((profile): profile is StockWithWatchlistStatus => 
          profile !== null && 
          typeof profile?.type === 'string'
        );
      } catch (error) {
        console.error('Error fetching popular stocks:', error);
        return [];
      }
    }

    // Handle search query
    try {
      const searchUrl = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
      const data = await fetchJSON<{ result?: Array<{ symbol: string; description: string; type: string }> }>(searchUrl, 1800);

      if (!data?.result) {
        return [];
      }

      // Transform to StockWithWatchlistStatus and limit to 15 results
      return data.result
        .map(item => ({
          symbol: item.symbol,
          name: item.description,
          exchange: 'US',
          type: item.type || 'Stock',
          isInWatchlist: false
        } as StockWithWatchlistStatus))
        .slice(0, 15);

    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  } catch (error) {
    console.error('Unexpected error in stock search:', error);
    return [];
  }
});

export const getStocksDetails = async (symbol: string) => {
  const token = FINNHUB_API_KEY;
  if (!token) {
    throw new Error('FINNHUB_API_KEY is not configured');
  }

  try {
    const [quote, profile, financials] = await Promise.all([
      fetchJSON<any>(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${token}`),
      fetchJSON<any>(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${token}`),
      fetchJSON<any>(`${FINNHUB_BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${token}`)
    ]);

    // Format market cap with proper handling for missing or zero values
    const formatMarketCap = (marketCap?: number) => {
      if (!marketCap || isNaN(marketCap) || marketCap <= 0) return 'N/A';
      if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`; // Trillions
      if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`; // Billions
      if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`; // Millions
      return `$${marketCap.toFixed(2)}`; // Less than a million
    };

    return {
      symbol,
      company: profile?.name || symbol,
      currentPrice: quote?.c || 0,
      priceFormatted: quote?.c ? `$${quote.c.toFixed(2)}` : 'N/A',
      changeFormatted: quote?.d ? `${quote.d > 0 ? '+' : ''}${quote.d.toFixed(2)} (${quote.dp?.toFixed(2) || '0.00'}%)` : 'N/A',
      changePercent: quote?.dp || 0,
      marketCapFormatted: formatMarketCap(profile?.marketCapitalization || financials?.metric?.marketCapitalization),
      peRatio: financials?.metric?.peNormalizedAnnual?.toFixed(2) || 'N/A'
    };
  } catch (error) {
    console.error('Error fetching stock details:', error);
    throw new Error('Failed to fetch stock details. Please try again later.');
  }
};

export const getNews = async (symbols?: string[]): Promise<MarketNewsArticle[]> => {
  try {
    const range = getDateRange(5);
    const token = FINNHUB_API_KEY;
    if (!token) {
      throw new Error('FINNHUB API key is not configured');
    }

    const cleanSymbols = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    const maxArticles = 6;

    // If we have symbols, try to fetch company news per symbol and round-robin select
    if (cleanSymbols.length > 0) {
      const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

      await Promise.all(
        cleanSymbols.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
            const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
            perSymbolArticles[sym] = (articles || []).filter(validateArticle);
          } catch (e) {
            console.error('Error fetching company news for', sym, e);
            perSymbolArticles[sym] = [];
          }
        })
      );

      const collected: MarketNewsArticle[] = [];
      // Round-robin up to maxArticles picks
      for (let round = 0; round < maxArticles; round++) {
        for (let i = 0; i < cleanSymbols.length; i++) {
          const sym = cleanSymbols[i];
          const list = perSymbolArticles[sym] || [];
          if (list.length === 0) continue;
          const article = list.shift();
          if (!article || !validateArticle(article)) continue;
          collected.push({
            ...formatArticle(article, true, sym, round),
            title: article.headline
          });
          if (collected.length >= maxArticles) break;
        }
        if (collected.length >= maxArticles) break;
      }

      if (collected.length > 0) {
        // Sort by datetime desc
        collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
        return collected.slice(0, maxArticles);
      }
    }

    // General market news fallback or when no symbols provided
    const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
    const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

    const seen = new Set<string>();
    const unique: MarketNewsArticle[] = [];
    
    for (const art of general || []) {
      if (!validateArticle(art)) continue;
      const key = `${art.id}-${art.url}-${art.headline}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push({
        ...formatArticle(art, false, undefined, 0),
        title: art.headline
      });
      if (unique.length >= 20) break;
    }

    return unique.slice(0, maxArticles);
  } catch (err) {
    console.error('getNews error:', err);
    throw new Error('Failed to fetch news');
  }
};