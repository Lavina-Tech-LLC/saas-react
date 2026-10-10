import { Box, Button, Group, Stack, Text } from '@mantine/core';

import type { FacePose } from '../../../auth/face/engine';
import type { FaceSample } from '../../../auth/types';
import { useT } from '../../context';
import { AuthCard } from '../ui/AuthCard';
import { ErrorAlert } from '../ui/ErrorAlert';
import { TextLink } from '../ui/TextLink';
import { useFaceCapture } from './useFaceCapture';

export interface FaceScannerProps {
  /** Poses to capture. Enrollment walks through several angles; verification passes a single "center" step. */
  poses: FacePose[];
  /** Copy above the camera preview. */
  title: string;
  subtitle?: string;
  /** Shown before the camera is switched on; enrollment uses it for consent. */
  consentText?: string;
  modelUrl?: string;
  confirmLabel: string;
  isSubmitting?: boolean;
  /** External error (e.g. the API rejected the samples). */
  error?: string | null;
  onCancel?: () => void;
  onComplete: (samples: FaceSample[]) => void | Promise<void>;
  /** Render without the card frame (e.g. inside a settings card). */
  withoutCard?: boolean;
}

export function FaceScanner({
  poses,
  title,
  subtitle,
  consentText,
  modelUrl,
  confirmLabel,
  isSubmitting = false,
  error,
  onCancel,
  onComplete,
  withoutCard,
}: FaceScannerProps) {
  const t = useT();
  const { videoRef, phase, stepIndex, canSkipPose, hint, engineError, start, cancel, requestSkip } = useFaceCapture({
    poses,
    modelUrl,
    onComplete,
    onCancel,
  });

  const status =
    phase === 'loading'
      ? t('face.status.preparing')
      : phase === 'done'
        ? isSubmitting
          ? t('face.status.saving')
          : t('face.status.done')
        : phase === 'failed'
          ? t('face.status.stopped')
          : hint;

  const content = (
    <Stack gap="md">
      <ErrorAlert message={error || engineError} />
      {phase === 'intro' ? (
        <>
          {consentText && (
            <Text fz="sm" c="dimmed" lh={1.6}>
              {consentText}
            </Text>
          )}
          <Button fullWidth onClick={start}>
            {confirmLabel}
          </Button>
        </>
      ) : (
        <>
          <Box
            pos="relative"
            w="100%"
            bdrs="lg"
            bg="var(--mantine-color-default-hover)"
            style={{ aspectRatio: '4 / 3', overflow: 'hidden' }}
          >
            {/* Mirrored like a selfie camera; pose names assume this mirroring */}
            <video
              ref={videoRef}
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            {/* Portrait oval — a face is taller than it is wide */}
            <Box
              pos="absolute"
              top="50%"
              left="50%"
              w="46%"
              h="88%"
              style={{
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: '2px dashed var(--mantine-primary-color-filled)',
                opacity: 0.6,
              }}
            />
          </Box>
          <Group justify="center" gap={6}>
            {poses.map((pose, i) => (
              <Box
                key={`${pose}-${i}`}
                w={28}
                h={4}
                bdrs="xl"
                bg={
                  i < stepIndex
                    ? 'green'
                    : i === stepIndex
                      ? 'var(--mantine-primary-color-filled)'
                      : 'var(--mantine-color-default-border)'
                }
              />
            ))}
          </Group>
          <Text ta="center" fz="sm" mih={20} aria-live="polite">
            {status}
          </Text>
          {phase === 'scanning' && canSkipPose && (
            <Group justify="center">
              <TextLink onClick={requestSkip}>{t('face.skipPose')}</TextLink>
            </Group>
          )}
          {phase === 'failed' && (
            <Button fullWidth onClick={start}>
              {t('face.retry')}
            </Button>
          )}
        </>
      )}
      {onCancel && (
        <Group justify="center">
          <TextLink onClick={cancel}>{t('common.cancel')}</TextLink>
        </Group>
      )}
    </Stack>
  );

  if (withoutCard) return content;
  return (
    <AuthCard title={title} subtitle={subtitle}>
      {content}
    </AuthCard>
  );
}
