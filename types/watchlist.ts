import { ReactNode } from 'react';

export interface WatchlistButtonProps {
  symbol: string;
  company: string;
  isInWatchlist: boolean;
  showTrashIcon?: boolean;
  type?: 'button' | 'icon';
  onWatchlistChange?: (symbol: string, isInWatchlist: boolean) => void;
  className?: string;
  children?: ReactNode;
}

export interface WatchlistItem {
  _id: string;
  userId: string;
  symbol: string;
  company: string;
  addedAt: string | Date;
  currentPrice?: number;
  priceFormatted?: string;
  changeFormatted?: string;
  changePercent?: number;
  marketCap?: string;
  peRatio?: string;
}

export interface WatchlistTableProps {
  watchlist: WatchlistItem[];
  className?: string;
}
