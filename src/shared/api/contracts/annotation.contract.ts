import { z } from 'zod';

// --- Entities ---

export const SectionSchema = z.object({
  id: z.number(),
  document_id: z.number(),
  parent_id: z.number().nullable(),
  heading: z.string(),
  content: z.string(),
  level: z.number(),
  position: z.number(),
  tags: z.array(z.string()).default([]),
});

export type Section = z.infer<typeof SectionSchema>;

export const DocumentSchema = z.object({
  id: z.number(),
  title: z.string(),
});

export type Document = z.infer<typeof DocumentSchema>;


// --- API Requests ---

export const ShatterRequestSchema = z.object({
  owner_id: z.number(),
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  raw_content: z.string().min(1, 'Nội dung không được để trống'),
});

export type ShatterRequest = z.infer<typeof ShatterRequestSchema>;

export const ManageTagRequestSchema = z.object({
  action: z.enum(['add', 'remove']),
  tags: z.array(z.string()).min(1, 'Cần ít nhất một tag'),
});

export type ManageTagRequest = z.infer<typeof ManageTagRequestSchema>;

export const UpdateSectionRequestSchema = z.object({
  heading: z.string().optional(),
  content: z.string().optional(),
  level: z.number().min(1).max(6).optional(),
});

export type UpdateSectionRequest = z.infer<typeof UpdateSectionRequestSchema>;

export const UpdateDocumentRequestSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
});

export type UpdateDocumentRequest = z.infer<typeof UpdateDocumentRequestSchema>;

export const SectionOrderUpdateSchema = z.object({
  id: z.number(),
  parent_id: z.number().nullable(),
  position: z.number(),
  level: z.number(),
});

export const ReorderSectionsRequestSchema = z.object({
  updates: z.array(SectionOrderUpdateSchema),
});

export type ReorderSectionsRequest = z.infer<typeof ReorderSectionsRequestSchema>;

export const CreateSectionRequestSchema = z.object({
  document_id: z.number(),
  parent_id: z.number().nullable(),
  heading: z.string(),
  content: z.string(),
  level: z.number(),
  position: z.number(),
});

export type CreateSectionRequest = z.infer<typeof CreateSectionRequestSchema>;

export const MoveSectionRequestSchema = z.object({
  target_document_id: z.number(),
  parent_id: z.number().nullable(),
  position: z.number(),
  level: z.number(),
});

export type MoveSectionRequest = z.infer<typeof MoveSectionRequestSchema>;


// --- API Responses ---

export const ShatterResponseSchema = z.object({
  data: z.object({
    document_id: z.number(),
    root_section_id: z.number(),
  }),
});

export type ShatterResponse = z.infer<typeof ShatterResponseSchema>;

export const TreeResponseSchema = z.object({
  data: z.object({
    root: SectionSchema,
    descendants: z.array(SectionSchema),
  }),
});

export type TreeResponse = z.infer<typeof TreeResponseSchema>;

export const SearchResponseSchema = z.object({
  data: z.array(SectionSchema),
  meta: z.object({
    page: z.number(),
    per_page: z.number(),
    total: z.number(),
    total_pages: z.number(),
  }).optional(), // Optional to handle cases where BE might not return it yet
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const ActionResponseSchema = z.object({
  data: z.object({
    message: z.string(),
  }),
});

export type ActionResponse = z.infer<typeof ActionResponseSchema>;

export const ListDocumentsResponseSchema = z.object({
  data: z.array(DocumentSchema),
  meta: z.object({
    page: z.number(),
    per_page: z.number(),
    total: z.number(),
    total_pages: z.number(),
  }),
});

export type ListDocumentsResponse = z.infer<typeof ListDocumentsResponseSchema>;

export const ListTagsResponseSchema = z.object({
  data: z.array(z.string()),
  meta: z.object({
    total: z.number(),
  }),
});

export type ListTagsResponse = z.infer<typeof ListTagsResponseSchema>;

