import type { Meta, StoryObj } from '@storybook/react';
import FileUpload from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const RequestingUrl: Story = {
  args: {
    initialUploadState: { status: 'requesting-url', progress: 0 },
  },
};

export const Uploading: Story = {
  args: {
    initialUploadState: { status: 'uploading', progress: 0.42 },
  },
};

export const Done: Story = {
  args: {
    initialUploadState: {
      status: 'done',
      progress: 1,
      result: {
        uploadUrl: 'https://example.com/upload',
        fileUrl: 'https://example.com/files/photo.jpg',
        fileKey: 'uploads/photo.jpg',
      },
    },
  },
};

export const Error: Story = {
  args: {
    initialUploadState: {
      status: 'error',
      progress: 0,
      error: 'Upload failed: Failed to get upload URL: Service Unavailable',
    },
  },
};
