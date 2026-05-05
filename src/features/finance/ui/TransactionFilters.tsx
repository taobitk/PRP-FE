'use client';

import { useWallets } from '../api/financeApi';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Props {
  onFilterChange: (filters: any) => void;
}

export function TransactionFilters({ onFilterChange }: Props) {
  const { data: wallets } = useWallets();

  return (
    <div className="grid gap-4 md:grid-cols-3 bg-surface p-4 rounded-lg border">
      <div className="space-y-2">
        <Label>Lọc theo ví</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          data-testid="finance-filter-wallet"
          onChange={(e) => onFilterChange({ wallet_id: e.target.value })}
        >
          <option value="">Tất cả ví</option>
          {wallets?.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Từ ngày</Label>
        <Input 
          type="date" 
          data-testid="finance-filter-date-start"
          onChange={(e) => onFilterChange({ start_date: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Đến ngày</Label>
        <Input 
          type="date" 
          data-testid="finance-filter-date-end"
          onChange={(e) => onFilterChange({ end_date: e.target.value })}
        />
      </div>
    </div>
  );
}
