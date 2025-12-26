"use client";

import { useCallback, useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { addToWatchlist, removeFromWatchlist } from '@/lib/actions/watchlist.actions';
import { useRouter } from 'next/navigation';
import { WatchlistButtonProps } from '@/types/watchlist';

export const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist = false,
  showTrashIcon = false,
  type = 'button',
  onWatchlistChange,
  className = '',
  children,
}: WatchlistButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(isInWatchlist);
  const router = useRouter();

  // Sync with prop changes
  useEffect(() => {
    setIsAdded(isInWatchlist);
  }, [isInWatchlist]);

  const toggleWatchlist = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const nextState = !isAdded;
    
    try {
      if (nextState) {
        const result = await addToWatchlist(symbol, company);
        if (result.success) {
          toast.success('Added to Watchlist', {
            description: `${company} has been added to your watchlist`,
          });
        } else if (result.error) {
          toast.warning('Already in Watchlist', {
            description: result.error,
          });
        }
      } else {
        const result = await removeFromWatchlist(symbol);
        if (result.success) {
          toast.success('Removed from Watchlist', {
            description: `${company} has been removed from your watchlist`,
          });
        }
      }
      
      setIsAdded(nextState);
      onWatchlistChange?.(symbol, nextState);
      
      // Refresh the page if we're on the watchlist page
      if (window.location.pathname === '/watchlist') {
        router.refresh();
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast.error('Error', {
        description: 'Failed to update watchlist. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [symbol, company, isAdded, isLoading, onWatchlistChange, router]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist();
  };

  if (type === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
        aria-label={isAdded ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        title={isAdded ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        {isLoading ? (
          <span className="animate-spin">🔄</span>
        ) : showTrashIcon && isAdded ? (
          <Trash2 className="w-4 h-4 text-red-500" />
        ) : (
          <Star
            className={`w-4 h-4 ${isAdded ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
          />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isAdded
          ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50'
      } ${className}`}
    >
      {isLoading ? (
        <span className="animate-spin mr-2">🔄</span>
      ) : showTrashIcon && isAdded ? (
        <Trash2 className="w-4 h-4 mr-2" />
      ) : null}
      {children || (isAdded ? 'Remove from Watchlist' : 'Add to Watchlist')}
    </button>
  );
};

export default WatchlistButton;
