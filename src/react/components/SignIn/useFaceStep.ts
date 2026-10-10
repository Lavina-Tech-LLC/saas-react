import { useState } from 'react';

import type { FaceRequiredResult, FaceSample } from '../../../auth/types';
import { useAuth } from '../../hooks/useAuth';
import { useFace } from '../../hooks/useFace';

/** Face control during sign-in / sign-up: verify against an enrolled face, or enroll a new one. */
export function useFaceStep(onCancelSignUp: () => void) {
  const { refreshUser } = useAuth();
  const face = useFace();
  const [faceChallenge, setFaceChallenge] = useState<FaceRequiredResult | null>(null);
  const [enrollAfterSignUp, setEnrollAfterSignUp] = useState(false);
  const enrolling = enrollAfterSignUp || !faceChallenge?.enrolled;

  const completeFace = async (samples: FaceSample[]) => {
    if (enrolling) {
      if (!(await face.enroll(samples, { faceToken: faceChallenge?.faceToken }))) return;
      setFaceChallenge(null);
      setEnrollAfterSignUp(false);
      await refreshUser();
    } else if (faceChallenge && samples.length > 0) {
      if (await face.verify(faceChallenge.faceToken, samples[0].descriptor)) setFaceChallenge(null);
    }
  };

  const cancelFace = () => {
    if (faceChallenge) onCancelSignUp();
    setFaceChallenge(null);
    setEnrollAfterSignUp(false);
    face.setError(null);
  };

  return {
    face,
    faceChallenge,
    setFaceChallenge,
    requireEnrollment: () => setEnrollAfterSignUp(true),
    faceActive: !!faceChallenge || enrollAfterSignUp,
    enrolling,
    completeFace,
    cancelFace,
  };
}
