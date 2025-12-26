'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface PriceAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  currentPrice: number;
  onSave: (data: { targetPrice: number; alertType: 'above' | 'below' }) => Promise<void>;
}

export function PriceAlertDialog({
  open,
  onOpenChange,
  symbol,
  currentPrice,
  onSave,
}: PriceAlertDialogProps) {
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({ targetPrice: price, alertType });
      toast.success(`Alert set for ${symbol} ${alertType} $${price.toFixed(2)}`);
      onOpenChange(false);
      setTargetPrice('');
    } catch (error) {
      console.error('Error setting alert:', error);
      toast.error('Failed to set alert');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Price Alert for {symbol}</DialogTitle>
            <DialogDescription>
              Get notified when the price of {symbol} goes {alertType} your target price.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetPrice" className="text-right">
                Target Price
              </Label>
              <Input
                id="targetPrice"
                type="number"
                step="0.01"
                min="0.01"
                className="col-span-3"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={`Current: $${currentPrice.toFixed(2)}`}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Alert When</Label>
              <RadioGroup
                value={alertType}
                onValueChange={(value: 'above' | 'below') => setAlertType(value)}
                className="col-span-3 flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="above" id="above" />
                  <Label htmlFor="above">Price goes above target</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="below" id="below" />
                  <Label htmlFor="below">Price goes below target</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Alert'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
