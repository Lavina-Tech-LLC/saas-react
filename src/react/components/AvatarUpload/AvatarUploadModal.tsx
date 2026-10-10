import { Alert, Box, Button, em, FileButton, Group, Modal, Paper, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ImageIcon, Info, Upload } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';

import { useT } from '../../context';
import { ErrorAlert } from '../ui/ErrorAlert';
import { AvatarCropper, type AvatarCropperHandle } from './AvatarCropper';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/png,image/jpeg,image/webp';

interface AvatarUploadModalProps {
  opened: boolean;
  onClose: () => void;
  /** Receives the cropped 256×256 PNG; the parent closes the modal on success. */
  onUpload: (blob: Blob) => Promise<void>;
  isLoading: boolean;
  /** Server-side failure of the last upload, shown inside the dialog. */
  uploadError?: string | null;
}

// LM3 §20 — form modal: full screen on phones, Cancel left / Save right
export function AvatarUploadModal({ opened, onClose, onUpload, isLoading, uploadError }: AvatarUploadModalProps) {
  const t = useT();
  const isMobile = useMediaQuery(`(max-width: ${em(767)})`);
  const cropperRef = useRef<AvatarCropperHandle>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <Modal opened={opened} onClose={close} title={t('avatar.title')} fullScreen={isMobile}>
      <Box p="md">
        <Stack gap="md">
          <ErrorAlert message={error || uploadError} />
          {file ? (
            <>
              <AvatarCropper ref={cropperRef} file={file} />
              <Group justify="center">
                <FileButton onChange={accept} accept={ACCEPT}>
                  {(props) => (
                    <Button {...props} variant="subtle" size="xs" leftSection={<ImageIcon size={14} />}>
                      {t('avatar.change')}
                    </Button>
                  )}
                </FileButton>
              </Group>
            </>
          ) : (
            <Paper
              withBorder
              p="xl"
              mih={220}
              style={{
                borderStyle: 'dashed',
                borderColor: dragOver ? 'var(--mantine-primary-color-filled)' : undefined,
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
                <Upload size={32} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text fw={600}>{t('avatar.drop')}</Text>
                <Text fz="sm" c="dimmed">
                  {t('avatar.formats')}
                </Text>
                <FileButton onChange={accept} accept={ACCEPT}>
                  {(props) => (
                    <Button {...props} variant="default" size="sm" mt="xs">
                      {t('avatar.choose')}
                    </Button>
                  )}
                </FileButton>
              </Stack>
            </Paper>
          )}
          <Alert color="blue" icon={<Info size={16} />} p="xs">
            {t('avatar.visibility')}
          </Alert>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button onClick={save} loading={isLoading} disabled={!file}>
              {t('common.saveShort')}
            </Button>
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
}
