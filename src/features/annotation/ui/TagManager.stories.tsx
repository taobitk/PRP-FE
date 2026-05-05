import type { Meta, StoryObj } from '@storybook/react';
import { TagManager } from './TagManager';
import { Toaster } from 'sonner';

import { QueryProvider } from '@/shared/lib/queryProvider';

const meta: Meta<typeof TagManager> = {
  title: 'Features/Annotation/TagManager',
  component: TagManager,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryProvider>
        <div className="p-10 max-w-md bg-white border rounded-2xl shadow-sm">
          <Story />
          <Toaster />
        </div>
      </QueryProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TagManager>;

export const Empty: Story = {
  args: {
    sectionId: 1,
    initialTags: [],
  },
};

export const WithTags: Story = {
  args: {
    sectionId: 1,
    initialTags: ['important', 'review', 'todo', 'finance', '2024'],
  },
};

export const ManyTags: Story = {
  args: {
    sectionId: 1,
    initialTags: Array.from({ length: 15 }, (_, i) => `tag-${i + 1}`),
  },
};
