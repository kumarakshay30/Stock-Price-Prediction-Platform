'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from './ui/button';
import WatchlistButton from './WatchlistButton';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { WatchlistItem } from '@/types/watchlist';
import { removeFromWatchlist, clearWatchlist } from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';
import { useState } from 'react';
import { PriceAlertDialog } from './PriceAlertDialog';

interface WatchlistTableProps {
  watchlist: WatchlistItem[];
  onUpdate?: () => void;
}

export function WatchlistTable({ watchlist, onUpdate }: WatchlistTableProps) {
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{symbol: string; currentPrice: number} | null>(null);
  const router = useRouter();

  // Function to determine the color class based on the change percentage
  const getChangeColorClass = (changePercent: number | undefined) => {
    if (changePercent === undefined) return 'text-gray-700 dark:text-gray-300';
    if (changePercent > 0) return 'text-green-600 dark:text-green-400';
    if (changePercent < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex justify-end p-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={async (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to clear your entire watchlist?')) {
              try {
                await clearWatchlist();
                toast.success('Watchlist cleared successfully');
                if (onUpdate) onUpdate();
              } catch (error) {
                console.error('Error clearing watchlist:', error);
                toast.error('Failed to clear watchlist');
              }
            }
          }}
          disabled={watchlist.length === 0}
        >
          Clear All
        </Button>
      </div>
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableHead className="w-[200px]">Company</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Change</TableHead>
            <TableHead className="text-right">Market Cap</TableHead>
            <TableHead className="text-right">P/E Ratio</TableHead>
            <TableHead className="w-[120px]"></TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlist.map((item) => (
            <TableRow
              key={item._id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              onClick={() => router.push(`/stocks/${item.symbol}`)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <span className="truncate max-w-[180px]">{item.company}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{item.symbol}</TableCell>
              <TableCell className="text-right font-medium">
                {item.priceFormatted}
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-medium',
                  getChangeColorClass(item.changePercent)
                )}
              >
                {item.changeFormatted}
              </TableCell>
              <TableCell className="text-right text-sm text-gray-500 dark:text-gray-400">
                {item.marketCap}
              </TableCell>
              <TableCell className="text-right text-sm text-gray-500 dark:text-gray-400">
                {item.peRatio}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStock({
                      symbol: item.symbol,
                      currentPrice: item.currentPrice || 0
                    });
                    setAlertDialogOpen(true);
                  }}
                >
                  Add Alert
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <div onClick={(e) => e.stopPropagation()}>
                  <WatchlistButton
                    symbol={item.symbol}
                    company={item.company}
                    isInWatchlist={true}
                    type="icon"
                    showTrashIcon={true}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {selectedStock && (
        <PriceAlertDialog
          open={alertDialogOpen}
          onOpenChange={setAlertDialogOpen}
          symbol={selectedStock.symbol}
          currentPrice={selectedStock.currentPrice}
          onSave={async ({ targetPrice, alertType }) => {
            // TODO: Implement actual alert saving logic
            // This is where you would call your API to save the alert
            console.log(`Setting alert for ${selectedStock.symbol} to notify when price is ${alertType} ${targetPrice}`);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success(`Alert set for ${selectedStock.symbol}`, {
              description: `You'll be notified when price goes ${alertType} $${targetPrice.toFixed(2)}`
            });
          }}
        />
      )}
    </div>
  );
}
