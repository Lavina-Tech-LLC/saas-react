import { Input, PinInput } from '@mantine/core';
import { useId } from 'react';

interface CodeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  hint?: string;
}

// 6-digit verification code (MFA, SMS): six large boxes under the field label, start-aligned with the other fields;
// one-time-code autofill, numbers only, focus moves on by itself
export function CodeInput({ label, value, onChange, onComplete, hint }: CodeInputProps) {
  const id = useId();
  return (
    <Input.Wrapper label={label} description={hint} id={id} inputWrapperOrder={['label', 'input', 'description']}>
      <PinInput
        id={id}
        length={6}
        size="lg"
        gap="xs"
        type="number"
        placeholder=""
        oneTimeCode
        autoFocus
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        aria-label={label}
        pt={6}
      />
    </Input.Wrapper>
  );
}
