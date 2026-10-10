import { useCallback, useEffect, useRef, useState } from 'react';

import {
  FaceEngineError,
  loadFaceEngine,
  readFace,
  type FaceCaptureIssue,
  type FacePose,
} from '../../../auth/face/engine';
import type { FaceSample } from '../../../auth/types';
import type { TranslationKey } from '../../../i18n';
import { useT } from '../../context';

// The issue identifiers are kebab-case while the translation keys are not, so
// the mapping is spelled out instead of being derived.
const ISSUE_KEYS: Record<FaceCaptureIssue, TranslationKey> = {
  'no-face': 'face.issue.noFace',
  'multiple-faces': 'face.issue.multipleFaces',
  'too-far': 'face.issue.tooFar',
  'low-quality': 'face.issue.lowQuality',
  'wrong-pose': 'face.issue.wrongPose',
};

export type FacePhase = 'intro' | 'loading' | 'scanning' | 'done' | 'failed';

/** How long a pose must be held before it is captured. */
const REQUIRED_STABLE_FRAMES = 3;
/** Gap between frame reads; the model needs ~100ms per frame on a laptop. */
const FRAME_INTERVAL_MS = 350;
/** Roughly 12 seconds of failing one angle before the skip link appears. */
const STUCK_TICKS_BEFORE_SKIP = 34;

interface FaceCaptureOptions {
  poses: FacePose[];
  modelUrl?: string;
  onComplete: (samples: FaceSample[]) => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Guided camera capture for face enrollment and verification. The stream stays in the browser:
 * frames become descriptors and are discarded — no image is uploaded or stored.
 */
export function useFaceCapture({ poses, modelUrl, onComplete, onCancel }: FaceCaptureOptions) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const samplesRef = useRef<FaceSample[]>([]);
  const stableRef = useRef(0);
  const cancelledRef = useRef(false);
  // How many poses have been dealt with, captured or skipped. Kept apart from
  // the sample count so a skipped angle still advances the wizard.
  const attemptedRef = useRef(0);
  const stuckTicksRef = useRef(0);
  const skipRequestedRef = useRef(false);

  const [phase, setPhase] = useState<FacePhase>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [canSkipPose, setCanSkipPose] = useState(false);
  const [hint, setHint] = useState<string>('');
  const [engineError, setEngineError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Release the camera on unmount even if the flow was abandoned mid-scan.
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      stopCamera();
    };
  }, [stopCamera]);

  const start = useCallback(async () => {
    cancelledRef.current = false;
    samplesRef.current = [];
    stableRef.current = 0;
    attemptedRef.current = 0;
    stuckTicksRef.current = 0;
    skipRequestedRef.current = false;
    setCanSkipPose(false);
    setStepIndex(0);
    setEngineError(null);
    setPhase('loading');

    // getUserMedia needs a secure context; say so plainly instead of surfacing
    // the browser's generic error.
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setEngineError(t('face.error.insecure'));
      setPhase('failed');
      return;
    }

    try {
      const api = await loadFaceEngine({ modelUrl });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (cancelledRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      video.srcObject = stream;
      await video.play();

      setPhase('scanning');
      setHint(t(`face.pose.${poses[0]}`));

      // Read frames until every pose has been captured.
      const tick = async () => {
        if (cancelledRef.current) return;
        const current = videoRef.current;
        if (!current || current.readyState < 2) {
          setTimeout(tick, FRAME_INTERVAL_MS);
          return;
        }

        const outcome = await readFace(api, current);
        if (cancelledRef.current) return;

        const wanted = poses[attemptedRef.current];

        // Moves to the next pose, or finishes. Returns true when done.
        const advance = async (): Promise<boolean> => {
          attemptedRef.current += 1;
          stableRef.current = 0;
          stuckTicksRef.current = 0;
          skipRequestedRef.current = false;
          setCanSkipPose(false);

          if (attemptedRef.current >= poses.length) {
            stopCamera();
            setPhase('done');
            await onComplete(samplesRef.current);
            return true;
          }
          setStepIndex(attemptedRef.current);
          setHint(t(`face.pose.${poses[attemptedRef.current]}`));
          return false;
        };

        if (skipRequestedRef.current) {
          if (await advance()) return;
          setTimeout(tick, FRAME_INTERVAL_MS);
          return;
        }

        if ('issue' in outcome) {
          stableRef.current = 0;
          setHint(t(ISSUE_KEYS[outcome.issue]));
        } else if (outcome.reading.pose !== wanted) {
          stableRef.current = 0;
          setHint(t(`face.pose.${wanted}`));
        } else {
          stableRef.current += 1;
          setHint(
            t('face.hold', {
              done: Math.min(stableRef.current, REQUIRED_STABLE_FRAMES),
              total: REQUIRED_STABLE_FRAMES,
            }),
          );

          if (stableRef.current >= REQUIRED_STABLE_FRAMES) {
            samplesRef.current = [
              ...samplesRef.current,
              {
                pose: wanted,
                descriptor: outcome.reading.descriptor,
                quality: outcome.reading.quality,
              },
            ];
            if (await advance()) return;
            setTimeout(tick, FRAME_INTERVAL_MS);
            return;
          }
        }

        // An angle the camera cannot agree on must not trap the wizard: offer to
        // move past it once something has already been captured, since a
        // template built from fewer angles still works.
        stuckTicksRef.current += 1;
        if (stuckTicksRef.current >= STUCK_TICKS_BEFORE_SKIP && samplesRef.current.length > 0) {
          setCanSkipPose(true);
        }

        setTimeout(tick, FRAME_INTERVAL_MS);
      };

      void tick();
    } catch (err) {
      stopCamera();
      if (err instanceof FaceEngineError) {
        setEngineError(err.message);
      } else if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setEngineError(t('face.error.denied'));
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setEngineError(t('face.error.noCamera'));
      } else {
        setEngineError(err instanceof Error ? err.message : t('face.error.start'));
      }
      setPhase('failed');
    }
  }, [modelUrl, onComplete, poses, stopCamera, t]);

  const handleCancel = useCallback(() => {
    cancelledRef.current = true;
    stopCamera();
    onCancel?.();
  }, [onCancel, stopCamera]);

  /** Skip the current angle on the next frame (offered after ~12 s stuck, once one sample exists). */
  const requestSkip = useCallback(() => {
    skipRequestedRef.current = true;
  }, []);

  return { videoRef, phase, stepIndex, canSkipPose, hint, engineError, start, cancel: handleCancel, requestSkip };
}
