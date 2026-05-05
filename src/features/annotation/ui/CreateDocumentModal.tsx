'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ShatterForm } from './ShatterForm';
import { Sparkles } from 'lucide-react';

interface CreateDocumentModalProps {
  trigger: React.ReactElement;
  nativeButton?: boolean;
  onSuccess?: (docId: number, rootId: number) => void;
}

export function CreateDocumentModal({ trigger, nativeButton = true, onSuccess }: CreateDocumentModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (docId: number, rootId: number) => {
    onSuccess?.(docId, rootId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={trigger} 
        nativeButton={nativeButton}
      />
      <DialogContent 
        className="max-w-[95vw] w-full max-h-[90vh] p-0 overflow-y-auto border-none shadow-2xl rounded-2xl duration-300 data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-4 block" 
        data-testid="annotation-create-modal"
      >
        <div className="bg-white">
          <DialogHeader className="p-8 border-b border-gray-100 bg-white sticky top-0 z-10 flex flex-row items-center gap-4">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm border border-indigo-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-black text-gray-900">Tải lên tài liệu mới</DialogTitle>
          </DialogHeader>
          <div className="p-0">
            <ShatterForm onSuccess={handleSuccess} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
