import type { Meta, StoryObj } from '@storybook/react';
import { ShatterForm } from './ShatterForm';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/shared/lib/queryProvider';

const meta: Meta<typeof ShatterForm> = {
  title: 'Features/Annotation/ShatterForm',
  component: ShatterForm,
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <QueryProvider>
        <div className="p-10 bg-slate-50 min-h-screen flex items-center justify-center">
          <Story />
          <Toaster />
        </div>
      </QueryProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ShatterForm>;

export const Default: Story = {};
