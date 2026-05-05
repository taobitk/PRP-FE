'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { FileText, Loader2, Sparkles, Upload } from 'lucide-react';
import { ShatterRequest, ShatterRequestSchema } from '@/shared/api/contracts/annotation.contract';
import { useShatter } from '../api/annotationApi';
import { useAuthStore } from '../../auth/model/authStore';

interface ShatterFormProps {
  onSuccess?: (docId: number, rootId: number) => void;
}

export function ShatterForm({ onSuccess }: ShatterFormProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  const form = useForm<ShatterRequest>({
    resolver: zodResolver(ShatterRequestSchema),
    defaultValues: {
      owner_id: user?.id || 0,
      title: '',
      raw_content: '',
    },
  });

  const { mutate: shatter, isPending } = useShatter();

  // Cập nhật owner_id khi user đã load xong
  useEffect(() => {
    if (user?.id) {
      form.setValue('owner_id', user.id);
    }
  }, [user, form]);

  const onSubmit = (data: ShatterRequest) => {
    shatter(data, {
      onSuccess: (response) => {
        toast.success('Document shattered successfully');
        router.push(`/annotations/documents/${response.data.document_id}/tree`);
        onSuccess?.(response.data.document_id, response.data.root_section_id);
      },
      onError: () => {
        toast.error('Failed to shatter document');
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      toast.error('Vui lòng chọn file Markdown (.md)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      form.setValue('raw_content', content);
      if (!form.getValues('title')) {
        form.setValue('title', file.name.replace('.md', ''));
      }
      toast.success(`Đã nạp nội dung từ file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full flex flex-col bg-white">
      <div className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Document Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Annual Financial Report 2024"
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl transition-all"
                      data-testid="shatter-title-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="raw_content"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-gray-700 font-medium">Document Content</FormLabel>
                    <label className="cursor-pointer group flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                      <Upload className="w-3 h-3" />
                      Tải file .md
                      <input 
                        type="file" 
                        accept=".md" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the text you want to annotate..."
                      className="min-h-[500px] text-lg resize-none border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-2xl transition-all bg-gray-50/30 p-6"
                      data-testid="shatter-content-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70"
              data-testid="shatter-submit-button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Shatter & Start Annotating
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
