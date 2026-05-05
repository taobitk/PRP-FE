import React from 'react';
import { DocumentList } from '@/features/annotation/ui/DocumentList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { CreateDocumentModal } from '@/features/annotation/ui/CreateDocumentModal';

export const metadata = {
  title: 'Annotation Management - GoPRP',
  description: 'Manage and analyze your Markdown documents.',
};

export default function AnnotationsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Annotations</h1>
          <p className="text-muted-foreground">
            View, manage, and analyze your shattered Markdown documents.
          </p>
        </div>
        <CreateDocumentModal 
          trigger={
            <Button 
              data-testid="annotation-create-trigger"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Upload New Document
            </Button>
          }
        />
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Your Documents</h2>
        <DocumentList />
      </div>
    </div>
  );
}
