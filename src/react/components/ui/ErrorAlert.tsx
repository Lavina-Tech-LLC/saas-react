import { Alert } from '@mantine/core';
import { AlertCircle } from 'lucide-react';

// LM3 §24 — inline error; renders nothing without a message
export function ErrorAlert({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <Alert color="red" icon={<AlertCircle size={16} />} p="xs">
      {message}
    </Alert>
  );
}
