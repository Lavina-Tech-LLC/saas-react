import { Button, FileButton, Group, Paper, Stack, Text } from '@mantine/core';
import { ImageIcon, Upload } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { BottomSheet } from '@/components/uiKit/Sheets';

import { useT } from '../../context';
import { AvatarCropper, type AvatarCropperHandle } from './AvatarCropper';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/png,image/jpeg,image/webp';

interface AvatarUploadModalProps {
  opened: boolean;
  onClose: () => void;
  /** Receives the cropped 256×256 PNG; the parent closes the sheet on success. */
  onUpload: (blob: Blob) => Promise<void>;
  isLoading: boolean;
  /** Server-side failure of the last upload, shown inside the sheet. */
  uploadError?: string | null;
}

// A new picture in a bottom sheet (LM3 §20): drop or choose an image, crop it, Save
export function AvatarUploadModal({ opened, onClose, onUpload, isLoading, uploadError }: AvatarUploadModalProps) {
  const t = useT();
  const cropperRef = useRef<AvatarCropperHandle>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const problem = error || uploadError;

  const accept = (f: File | null | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) return setError(t('avatar.notImage'));
    if (f.size > MAX_BYTES) return setError(t('avatar.tooLarge'));
    setError(null);
    setFile(f);
  };
  const close = () => {
    setFile(null);
    setError(null);
    onClose();
  };
  const save = async () => {
    const blob = await cropperRef.current?.crop();
    if (blob) await onUpload(blob);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    accept(e.dataTransfer.files[0]);
  };

  return (
    <BottomSheet
      opened={opened}
      onClose={close}
      title={t('avatar.title')}
      actions={
        <>
          <Button variant="default" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button onClick={save} loading={isLoading} disabled={!file}>
            {t('common.saveShort')}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        {problem && <AppAlert severity="error">{problem}</AppAlert>}
        {file ? (
          <>
            <AvatarCropper ref={cropperRef} file={file} />
            <Group justify="center">
              <FileButton onChange={accept} accept={ACCEPT}>
                {(props) => (
                  <Button {...props} variant="default" leftSection={<ImageIcon size={18} />}>
                    {t('avatar.change')}
                  </Button>
                )}
              </FileButton>
            </Group>
          </>
        ) : (
          <Paper
            p="xl"
            mih={220}
            shadow="none"
            style={{
              border: `1px dashed ${dragOver ? 'var(--m3-indicator)' : 'var(--m3-outline)'}`,
              display: 'grid',
              placeItems: 'center',
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <Stack align="center" gap="xs">
              <Upload size={32} color="var(--mantine-color-dimmed)" />
              <Text fw={600}>{t('avatar.drop')}</Text>
              <Text fz="sm" c="dimmed">
                {t('avatar.formats')}
              </Text>
              <FileButton onChange={accept} accept={ACCEPT}>
                {(props) => (
                  <Button {...props} variant="default" mt="xs">
                    {t('avatar.choose')}
                  </Button>
                )}
              </FileButton>
            </Stack>
          </Paper>
        )}
        <AppAlert severity="info">{t('avatar.visibility')}</AppAlert>
      </Stack>
    </BottomSheet>
  );
}
