'use client';

import * as React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default' | 'warning';
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
  isLoading = false
}: ConfirmDialogProps) {
  const Icon = variant === 'destructive' ? Trash2 : (variant === 'warning' ? AlertCircle : HelpCircle);
  const colorClass = variant === 'destructive' ? 'bg-red-50 text-red-600' : (variant === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none p-0 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          <div className={`h-20 w-20 rounded-full ${colorClass} flex items-center justify-center mb-6 animate-bounce-subtle shadow-inner`}>
            <Icon className="h-10 w-10" />
          </div>
          
          <div className="space-y-3">
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">{title}</DialogTitle>
            <DialogDescription className="text-slate-500 text-base leading-relaxed max-w-[320px]">
              {description}
            </DialogDescription>
          </div>
        </div>

        <DialogFooter className="bg-slate-50/80 p-6 gap-3 sm:justify-center border-t border-slate-100/80 backdrop-blur-sm">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="rounded-2xl px-8 h-12 font-bold border-slate-200 hover:bg-white hover:border-slate-300 transition-all shadow-sm"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }} 
            className={`rounded-2xl px-10 h-12 font-bold shadow-lg transition-all active:scale-95 ${
              variant === 'default' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'shadow-red-100'
            }`}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
      
      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </Dialog>
  );
}
