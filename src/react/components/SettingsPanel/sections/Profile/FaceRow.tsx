import { Box, Button, Group, Modal } from '@mantine/core';
import { ScanFace, ScanLine, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { FacePose } from '../../../../../auth/face/engine';
import type { FaceSample } from '../../../../../auth/types';
import { useSaaSContext } from '../../../../context';
import { useFace } from '../../../../hooks/useFace';
import { FaceScanner } from '../../../FaceScanner/FaceScanner';
import { ConfirmModal } from '../../../ui/ConfirmModal';
import { ErrorAlert } from '../../../ui/ErrorAlert';
import { SettingsRow } from '../../../ui/SettingsRow';
import { useColorVariant } from '../../../ui/useColorVariant';

const DEFAULT_POSES: FacePose[] = ['center', 'left', 'right', 'up', 'down'];

// Face sign-in row — rendered only when the project uses face verification; scanning happens in a dialog
export function FaceRow() {
  const { t, settings } = useSaaSContext();
  const colorVariant = useColorVariant();
  const { status, refreshStatus, enroll, remove, isLoading, error, setError } = useFace();
  const [scanning, setScanning] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const required = settings?.faceVerificationMode === 'required';

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const complete = async (samples: FaceSample[]) => {
    if (!(await enroll(samples))) return;
    setScanning(false);
    await refreshStatus();
  };

  const closeScanner = () => {
    setScanning(false);
    setError(null);
  };

  const deleteData = async () => {
    if (await remove()) setConfirmDelete(false);
  };

  return (
    <>
      <SettingsRow
        icon={ScanFace}
        color="cyan"
        label={t('face.row')}
        description={required ? t('face.requiredShort') : t('face.optionalShort')}
        value={status?.enrolled ? t('face.on') : t('face.off')}
        action={
          <Group gap="xs" wrap="nowrap">
            {status?.enrolled && !required && (
              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<Trash2 size={14} />}
                onClick={() => setConfirmDelete(true)}
              >
                {t('common.remove')}
              </Button>
            )}
            <Button
              size="xs"
              variant={colorVariant}
              leftSection={<ScanLine size={14} />}
              onClick={() => setScanning(true)}
            >
              {status?.enrolled ? t('face.rescanButton') : t('face.setUp')}
            </Button>
          </Group>
        }
      />
      {error && !scanning && (
        <Box px="md" pb="sm">
          <ErrorAlert message={error} />
        </Box>
      )}
      <Modal
        opened={scanning}
        onClose={closeScanner}
        title={status?.enrolled ? t('face.rescan.title') : t('face.enroll.title')}
      >
        <Box p="md">
          <FaceScanner
            withoutCard
            poses={(status?.poses as FacePose[] | undefined) ?? DEFAULT_POSES}
            title={status?.enrolled ? t('face.rescan.title') : t('face.enroll.title')}
            consentText={t('face.consent')}
            confirmLabel={t('face.enroll.start')}
            modelUrl={settings?.faceModelUrl}
            isSubmitting={isLoading}
            error={error}
            onComplete={complete}
            onCancel={closeScanner}
          />
        </Box>
      </Modal>
      <ConfirmModal
        opened={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteData}
        title={t('face.deleteData')}
        confirmLabel={t('common.remove')}
        loading={isLoading}
      >
        {t('face.deleteConfirm')}
      </ConfirmModal>
    </>
  );
}
