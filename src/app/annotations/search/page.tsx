import { AnnotationSearch } from '@/features/annotation/ui/AnnotationSearch';
import { ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CreateDocumentModal } from '@/features/annotation/ui/CreateDocumentModal';

export default function SearchPage() {
  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Tag className="h-10 w-10 text-primary" />
            Khám phá tri thức
          </h1>
          <p className="text-text-secondary text-lg">
            Tìm kiếm mọi đoạn nội dung dựa trên các nhãn bạn đã gắn.
          </p>
        </div>
        <CreateDocumentModal
          trigger={
            <Button variant="outline" className="gap-2">
              Thêm tài liệu mới
            </Button>
          }
        />
      </div>

      <AnnotationSearch />
    </div>
  );
}
