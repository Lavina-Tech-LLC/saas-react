import { Alert } from '@mantine/core';
import { CheckCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export function SuccessAlert({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <Alert color="green" icon={<CheckCircle size={16} />} p="xs">
      {children}
    </Alert>
  );
}
