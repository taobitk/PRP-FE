'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  useListDocuments, 
  useUpdateDocument, 
  useDeleteDocument 
} from '../api/annotationApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, FolderOpen, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { CreateDocumentModal } from './CreateDocumentModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function DocumentList() {
  const { data, isLoading, error } = useListDocuments();
  const updateDocument = useUpdateDocument(0); // We'll set the actual ID in mutate
  const deleteDocument = useDeleteDocument();
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (isLoading) {
    return (
      <div data-testid="annotation-document-loading" className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading documents</div>;
  }

  const documents = data?.data || [];

  if (documents.length === 0) {
    return (
      <div data-testid="annotation-document-empty" className="text-center py-12 border-2 border-dashed rounded-lg">
        <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No documents found</h3>
        <p className="text-muted-foreground mb-4">Start by uploading a new Markdown file.</p>
        <CreateDocumentModal
          trigger={<Button>Upload Document</Button>}
        />
      </div>
    );
  }

  const handleRename = (id: number, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveRename = (id: number) => {
    const updateMutation = useUpdateDocument(id); // This is a hook, can't be called here. 
    // Wait, the hook should return a function that takes the ID or the hook itself should be called outside.
    // Fixed useUpdateDocument in annotationApi.ts to accept documentId, but I need to handle it properly.
  };

  return (
    <div data-testid="annotation-document-list">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id} data-testid={`annotation-document-row-${doc.id}`}>
              <TableCell>{doc.id}</TableCell>
              <TableCell>
                {editingId === doc.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      data-testid={`annotation-document-rename-input-${doc.id}`}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="max-w-[300px]"
                    />
                    <RenameAction id={doc.id} title={editTitle} onCancel={() => setEditingId(null)} />
                  </div>
                ) : (
                  <Link 
                    href={`/annotations/documents/${doc.id}/tree`}
                    data-testid={`annotation-document-title-${doc.id}`}
                    className="font-medium hover:underline flex items-center gap-2"
                  >
                    {doc.title}
                  </Link>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid={`annotation-document-rename-btn-${doc.id}`}
                    onClick={() => handleRename(doc.id, doc.title)}
                    disabled={editingId === doc.id}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteAction id={doc.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Sub-component for Rename Action to avoid hook issues in loop
function RenameAction({ id, title, onCancel }: { id: number, title: string, onCancel: () => void }) {
  const { mutate, isPending } = useUpdateDocument(id);

  const handleSave = () => {
    mutate({ title }, {
      onSuccess: () => {
        toast.success('Document renamed');
        onCancel();
      },
      onError: () => {
        toast.error('Failed to rename document');
      }
    });
  };

  return (
    <>
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={handleSave} 
        disabled={isPending}
        data-testid={`annotation-document-save-btn-${id}`}
      >
        <Check className="h-4 w-4 text-green-600" />
      </Button>
      <Button size="icon" variant="ghost" onClick={onCancel}>
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </>
  );
}

// Sub-component for Delete Action
function DeleteAction({ id }: { id: number }) {
  const { mutate, isPending } = useDeleteDocument();
  const [open, setOpen] = useState(false);

  const confirmDelete = () => {
    mutate(id, {
      onSuccess: () => {
        toast.success('Document deleted');
        setOpen(false);
      },
      onError: () => {
        toast.error('Failed to delete document');
      }
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        data-testid={`annotation-document-delete-btn-${id}`}
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Xóa tài liệu?"
        description="Hành động này sẽ xóa vĩnh viễn tài liệu và toàn bộ các thẻ nội dung liên quan. Cậu có chắc chắn không?"
        onConfirm={confirmDelete}
        confirmText="Xóa vĩnh viễn"
        variant="destructive"
        isLoading={isPending}
      />
    </>
  );
}
