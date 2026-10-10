import { Group, PinInput, Stack, Text } from '@mantine/core';

interface CodeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  hint?: string;
}

// 6-digit verification code (MFA, SMS) — one-time-code autofill, numbers only, focus moves automatically
export function CodeInput({ label, value, onChange, onComplete, hint }: CodeInputProps) {
  return (
    <Stack gap={6}>
      <Text fz="sm">{label}</Text>
      <Group justify="center">
        <PinInput
          length={6}
          type="number"
          oneTimeCode
          autoFocus
          value={value}
          onChange={onChange}
          onComplete={onComplete}
          aria-label={label}
        />
      </Group>
      {hint && (
        <Text fz="xs" c="dimmed" ta="center">
          {hint}
        </Text>
      )}
    </Stack>
  );
}
