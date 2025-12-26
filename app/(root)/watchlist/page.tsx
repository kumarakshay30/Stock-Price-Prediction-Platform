import { Star } from 'lucide-react';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import SearchCommand from '@/components/SearchCommand';
import { getWatchlistWithData } from '@/lib/actions/watchlist.actions';
import { WatchlistTable } from '../../../components/WatchlistTable';

export default async function WatchlistPage() {
  const watchlist = await getWatchlistWithData();
  const initialStocks = await searchStocks();

  // Empty state
  if (watchlist.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Star className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your watchlist is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start building your watchlist by searching for stocks and clicking the star icon to add them.
          </p>
          <SearchCommand initialStocks={initialStocks} />
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Watchlist</h2>
          <SearchCommand initialStocks={initialStocks} />
        </div>
        <WatchlistTable watchlist={watchlist} />
      </div>
    </section>
  );
}
