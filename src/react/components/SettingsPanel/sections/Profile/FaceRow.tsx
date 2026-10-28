import { Button, Text } from '@mantine/core';
import { ChevronRight, ScanFace } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AppModal } from '@/components/uiKit/AppModal';
import { ConfirmDialog } from '@/components/uiKit/ConfirmDialog';
import { ListItem } from '@/components/uiKit/List';
import { BottomSheet } from '@/components/uiKit/Sheets';

import type { FacePose } from '../../../../../auth/face/engine';
import type { FaceSample } from '../../../../../auth/types';
import { useSaaSContext } from '../../../../context';
import { useFace } from '../../../../hooks/useFace';
import { FaceScanner } from '../../../FaceScanner/FaceScanner';

const DEFAULT_POSES: FacePose[] = ['center', 'left', 'right', 'up', 'down'];

// The face sign-in row — only when the project uses face verification. Not set up yet: the row starts the scan (in its
// own window); set up: it opens a sheet to scan again or remove it
export function FaceRow() {
  const { t, settings } = useSaaSContext();
  const { status, refreshStatus, enroll, remove, isLoading, error, setError } = useFace();
  const [scanning, setScanning] = useState(false);
  const [managing, setManaging] = useState(false);
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
  const press = () => (status?.enrolled ? setManaging(true) : setScanning(true));
  const sheetTo = (next: 'scan' | 'delete') => {
    setManaging(false);
    if (next === 'scan') setScanning(true);
    else setConfirmDelete(true);
  };

  return (
    <>
      <ListItem
        leading={<ScanFace />}
        headline={t('face.row')}
        supportingText={`${status?.enrolled ? t('face.on') : t('face.off')} · ${
          required ? t('face.requiredShort') : t('face.optionalShort')
        }`}
        wrapText
        trailing={<ChevronRight size={20} />}
        onClick={press}
      />
      <BottomSheet
        opened={managing}
        onClose={() => setManaging(false)}
        title={t('face.row')}
        actions={
          <>
            {!required && (
              <Button variant="light" color="red" onClick={() => sheetTo('delete')}>
                {t('face.deleteData')}
              </Button>
            )}
            <Button onClick={() => sheetTo('scan')}>{t('face.rescanButton')}</Button>
          </>
        }
      >
        <Text>{t('face.enrolled')}</Text>
      </BottomSheet>
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
