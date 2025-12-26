"use client"

import { useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Loader2, Star, Search } from "lucide-react"
import { searchStocks } from "@/lib/actions/finnhub.actions"
import { addToWatchlist, removeFromWatchlist, getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions"
import { useDebounce } from "@/hooks/useDebounce"

// Define the base stock interface from the API
interface StockResult {
  symbol: string
  name: string
  exchange: string
  type?: string
}

interface StockWithWatchlistStatus extends StockResult {
  symbol: string
  name: string
  exchange: string
  isInWatchlist: boolean
  type?: string
}

interface SearchCommandProps {
  renderAs?: 'button' | 'text'
  label?: string
  initialStocks?: StockWithWatchlistStatus[]
  initialWatchlistSymbols?: string[]
  onWatchlistUpdate?: () => Promise<void>
}

export default function SearchCommand({ 
  renderAs = 'button', 
  label = 'Add stock', 
  initialStocks = [],
  initialWatchlistSymbols = [],
  onWatchlistUpdate
}: SearchCommandProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({})
  const [userWatchlist, setUserWatchlist] = useState<Set<string>>(new Set())

  const isSearchMode = !!searchTerm.trim()
  const displayStocks = isSearchMode ? stocks.slice(0, 10) : stocks.slice(0, 10)
  const showTopStocks = stocks.length > 0
  
  const handleWatchlistToggle = async (stock: StockWithWatchlistStatus, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isProcessing[stock.symbol]) return
    
    setIsProcessing(prev => ({ ...prev, [stock.symbol]: true }))
    
    try {
      if (stock.isInWatchlist) {
        await removeFromWatchlist(stock.symbol)
        // Update local state
        setUserWatchlist(prev => {
          const newSet = new Set(prev)
          newSet.delete(stock.symbol)
          return newSet
        })
      } else {
        await addToWatchlist(stock.symbol, stock.name)
        // Update local state
        setUserWatchlist(prev => new Set(prev).add(stock.symbol))
      }
      
      // Update the stocks list with new watchlist status
      setStocks(prev => 
        prev.map(s => 
          s.symbol === stock.symbol 
            ? { ...s, isInWatchlist: !s.isInWatchlist } 
            : s
        )
      )
      
      // Notify parent component about the update
      if (onWatchlistUpdate) {
        await onWatchlistUpdate()
      }
    } catch (error) {
      console.error('Error updating watchlist:', error)
    } finally {
      setIsProcessing(prev => ({ ...prev, [stock.symbol]: false }))
    }
  }

  // Initialize with watchlist symbols from props
  useEffect(() => {
    if (initialWatchlistSymbols.length > 0) {
      setUserWatchlist(new Set(initialWatchlistSymbols))
      
      // Update stocks with initial watchlist status
      setStocks(prevStocks => 
        prevStocks.map(stock => ({
          ...stock,
          isInWatchlist: initialWatchlistSymbols.includes(stock.symbol)
        }))
      )
    }
  }, [initialWatchlistSymbols])
  
  // Fetch top stocks when the dialog opens
  useEffect(() => {
    if (open && isInitialLoad) {
      const fetchTopStocks = async () => {
        try {
          setLoading(true)
          const topStocks: StockResult[] = await searchStocks('')
          setStocks(prevStocks =>
            topStocks.map(stock => ({
              ...stock,
              isInWatchlist: userWatchlist.has(stock.symbol)
            }))
          )
        } catch (error) {
          console.error('Error fetching top stocks:', error)
        } finally {
          setLoading(false)
          setIsInitialLoad(false)
        }
      }
      
      fetchTopStocks()
    }
  }, [open, isInitialLoad, userWatchlist])

  // Debounce search
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300)

  useEffect(() => {
    if (!open) return
    
    const search = async () => {
      if (!debouncedSearchTerm.trim()) {
        // When search is cleared, show top stocks again
        if (!isInitialLoad) {
          try {
            const topStocks: StockResult[] = await searchStocks('')
            setStocks(prevStocks =>
              topStocks.map(stock => ({
                ...stock,
                isInWatchlist: userWatchlist.has(stock.symbol)
              }))
            )
          } catch (error) {
            console.error('Error fetching top stocks:', error)
          }
        }
        return
      }
      
      setLoading(true)
      try {
        const searchResults = await searchStocks(debouncedSearchTerm)
        // Update search results with current watchlist status
        const resultsWithWatchlistStatus = searchResults.map(stock => ({
          ...stock,
          isInWatchlist: userWatchlist.has(stock.symbol)
        }))
        setStocks(resultsWithWatchlistStatus)
      } catch (error) {
        console.error('Search error:', error)
        setStocks([])
      } finally {
        setLoading(false)
      }
    }
    
    search()
  }, [debouncedSearchTerm, open, isInitialLoad, userWatchlist])

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      {renderAs === 'button' ? (
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          {label}
        </Button>
      ) : (
        <span 
          onClick={() => setOpen(true)} 
          className="search-text cursor-pointer hover:text-foreground transition-colors"
        >
          {label}
        </span>
      )}
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search stocks..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {showTopStocks && !isSearchMode && (
                <CommandGroup heading="Top Stocks">
                  {displayStocks.map((stock) => (
                    <CommandItem
                      key={stock.symbol}
                      value={stock.symbol}
                      onSelect={() => {
                        window.location.href = `/stocks/${stock.symbol}`
                        setOpen(false)
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {stock.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => handleWatchlistToggle(stock, e)}
                            disabled={isProcessing[stock.symbol]}
                            className="p-1.5 rounded-full hover:bg-accent transition-colors"
                            aria-label={stock.isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                          >
                            {isProcessing[stock.symbol] ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Star 
                                className={`h-4 w-4 ${stock.isInWatchlist ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {isSearchMode && displayStocks.length === 0 && (
                <CommandEmpty>No stocks found. Try a different search term.</CommandEmpty>
              )}
              
              {isSearchMode && displayStocks.length > 0 && (
                <CommandGroup heading="Search Results">
                  {displayStocks.map((stock) => (
                    <CommandItem
                      key={stock.symbol}
                      value={stock.symbol}
                      onSelect={() => {
                        window.location.href = `/stocks/${stock.symbol}`
                        setOpen(false)
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {stock.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => handleWatchlistToggle(stock, e)}
                            disabled={isProcessing[stock.symbol]}
                            className="p-1.5 rounded-full hover:bg-accent transition-colors"
                            aria-label={stock.isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                          >
                            {isProcessing[stock.symbol] ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Star 
                                className={`h-4 w-4 ${stock.isInWatchlist ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}