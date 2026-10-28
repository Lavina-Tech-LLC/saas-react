import { Button, Group } from '@mantine/core';
import { ScanFace, ScanLine } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { AppModal } from '@/components/uiKit/AppModal';
import { ConfirmDialog } from '@/components/uiKit/ConfirmDialog';
import { SettingsRow } from '@/components/uiKit/SettingsRow';

import type { FacePose } from '../../../../../auth/face/engine';
import type { FaceSample } from '../../../../../auth/types';
import { useSaaSContext } from '../../../../context';
import { useFace } from '../../../../hooks/useFace';
import { FaceScanner } from '../../../FaceScanner/FaceScanner';

const DEFAULT_POSES: FacePose[] = ['center', 'left', 'right', 'up', 'down'];

// The face sign-in tile — only when the project uses face verification; the scan runs in its own window
export function FaceRow() {
  const { t, settings } = useSaaSContext();
  const { status, refreshStatus, enroll, remove, isLoading, error, setError } = useFace();
  const [scanning, setScanning] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const required = settings?.faceVerificationMode === 'required';
  const title = status?.enrolled ? t('face.rescan.title') : t('face.enroll.title');

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
              <Button variant="light" color="red" onClick={() => setConfirmDelete(true)}>
                {t('common.remove')}
              </Button>
            )}
            <Button variant="light" leftSection={<ScanLine size={16} />} onClick={() => setScanning(true)}>
              {status?.enrolled ? t('face.rescanButton') : t('face.setUp')}
            </Button>
          </Group>
        }
      />
      {error && !scanning && !confirmDelete && (
        <AppAlert severity="error" onClose={() => setError(null)}>
          {error}
        </AppAlert>
      )}
      <AppModal opened={scanning} onClose={closeScanner} title={title} size="md">
        <FaceScanner
          withoutCard
          poses={(status?.poses as FacePose[] | undefined) ?? DEFAULT_POSES}
          title={title}
          consentText={t('face.consent')}
          confirmLabel={t('face.enroll.start')}
          modelUrl={settings?.faceModelUrl}
          isSubmitting={isLoading}
          error={error}
          onComplete={complete}
          onCancel={closeScanner}
        />
      </AppModal>
      <ConfirmDialog
        opened={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteData}
        title={t('face.deleteTitle')}
        description={t('face.deleteConfirm')}
        confirmLabel={t('face.deleteData')}
        loading={isLoading}
        error={error}
      />
    </>
  );
}
