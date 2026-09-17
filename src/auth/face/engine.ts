/**
 * Face capture engine.
 *
 * Frames never leave the browser: the camera image is turned into a 128-number
 * descriptor here, and only that descriptor is sent to the API. The recognition
 * model is several megabytes, so it is pulled from a CDN on demand instead of
 * being bundled — nothing is downloaded until a project actually turns face
 * verification on.
 */

export type FacePose = 'center' | 'left' | 'right' | 'up' | 'down'

export interface FaceReading {
  /** 128-number embedding of the detected face. */
  descriptor: number[]
  /** Detector confidence, 0..1. */
  quality: number
  /** Which way the head is turned, derived from the landmark geometry. */
  pose: FacePose
  /** Share of the frame width taken up by the face, 0..1. */
  coverage: number
}

export type FaceCaptureIssue =
  | 'no-face'
  | 'multiple-faces'
  | 'too-far'
  | 'low-quality'
  | 'wrong-pose'

export class FaceEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FaceEngineError'
  }
}

const DEFAULT_SCRIPT_URL =
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/dist/face-api.js'
const DEFAULT_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model'

/** Minimum detector confidence for a reading to be accepted. */
const MIN_CONFIDENCE = 0.5
/** The face must fill at least this share of the frame width. */
const MIN_COVERAGE = 0.18

// Minimal shape of the parts of face-api this module touches.
interface FaceApiPoint { x: number; y: number }
interface FaceApiDetection {
  detection: { score: number; box: { width: number } }
  landmarks: { positions: FaceApiPoint[] }
  descriptor: Float32Array
}
interface FaceApi {
  nets: Record<string, { loadFromUri(url: string): Promise<void> }>
  TinyFaceDetectorOptions: new (options?: { inputSize?: number; scoreThreshold?: number }) => unknown
  detectAllFaces(
    input: HTMLVideoElement,
    options: unknown,
  ): {
    withFaceLandmarks(): { withFaceDescriptors(): Promise<FaceApiDetection[]> }
  }
}

let scriptPromise: Promise<FaceApi> | null = null
let modelsPromise: Promise<void> | null = null

function loadScript(url: string): Promise<FaceApi> {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<FaceApi>((resolve, reject) => {
    const existing = (window as unknown as { faceapi?: FaceApi }).faceapi
    if (existing) {
      resolve(existing)
      return
    }

    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      const api = (window as unknown as { faceapi?: FaceApi }).faceapi
      if (!api) {
        reject(new FaceEngineError('Face model script loaded but exposed no API'))
        return
      }
      resolve(api)
    }
    script.onerror = () =>
      reject(new FaceEngineError('Could not load the face recognition model'))
    document.head.appendChild(script)
  }).catch((err) => {
    // Let a later attempt retry instead of caching the failure forever.
    scriptPromise = null
    throw err
  })

  return scriptPromise
}

/**
 * Downloads the script and model weights. Safe to call repeatedly — the work
 * happens once per page.
 */
export async function loadFaceEngine(options?: {
  scriptUrl?: string
  modelUrl?: string
}): Promise<FaceApi> {
  const api = await loadScript(options?.scriptUrl || DEFAULT_SCRIPT_URL)
  const modelUrl = options?.modelUrl || DEFAULT_MODEL_URL

  if (!modelsPromise) {
    modelsPromise = Promise.all([
      api.nets.tinyFaceDetector.loadFromUri(modelUrl),
      api.nets.faceLandmark68Net.loadFromUri(modelUrl),
      api.nets.faceRecognitionNet.loadFromUri(modelUrl),
    ])
      .then(() => undefined)
      .catch((err) => {
        modelsPromise = null
        throw new FaceEngineError(
          `Could not load the face model weights: ${err instanceof Error ? err.message : err}`,
        )
      })
  }
  await modelsPromise

  return api
}

/**
 * Classifies head orientation from the 68-point landmark set.
 *
 * These are geometric proxies, not a calibrated head-pose solver: the nose tip
 * is compared against the eye corners horizontally and against the eye/chin line
 * vertically. Tolerances are generous on purpose — the poses exist to make the
 * enrollment cover several angles, not to measure anything.
 */
function classifyPose(points: FaceApiPoint[]): FacePose {
  const leftEyeOuter = points[36]
  const rightEyeOuter = points[45]
  const noseTip = points[30]
  const chin = points[8]
  if (!leftEyeOuter || !rightEyeOuter || !noseTip || !chin) return 'center'

  const span = rightEyeOuter.x - leftEyeOuter.x
  if (span !== 0) {
    const yawRatio = (noseTip.x - leftEyeOuter.x) / span
    if (yawRatio < 0.38) return 'left'
    if (yawRatio > 0.62) return 'right'
  }

  const eyeLineY = (leftEyeOuter.y + rightEyeOuter.y) / 2
  const height = chin.y - eyeLineY
  if (height !== 0) {
    const pitchRatio = (noseTip.y - eyeLineY) / height
    if (pitchRatio < 0.32) return 'up'
    if (pitchRatio > 0.6) return 'down'
  }

  return 'center'
}

/**
 * Reads one frame off the video element.
 *
 * Returns `{ issue }` for a frame that is not good enough to use — the caller
 * turns that into on-screen guidance rather than an error.
 */
export async function readFace(
  api: FaceApi,
  video: HTMLVideoElement,
): Promise<{ reading: FaceReading } | { issue: FaceCaptureIssue }> {
  const results = await api
    .detectAllFaces(video, new api.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
    .withFaceLandmarks()
    .withFaceDescriptors()

  if (results.length === 0) return { issue: 'no-face' }
  // More than one face in frame makes it ambiguous whose descriptor is stored.
  if (results.length > 1) return { issue: 'multiple-faces' }

  const result = results[0]
  if (result.detection.score < MIN_CONFIDENCE) return { issue: 'low-quality' }

  const coverage = video.videoWidth > 0 ? result.detection.box.width / video.videoWidth : 0
  if (coverage < MIN_COVERAGE) return { issue: 'too-far' }

  return {
    reading: {
      descriptor: Array.from(result.descriptor),
      quality: result.detection.score,
      pose: classifyPose(result.landmarks.positions),
      coverage,
    },
  }
}

/** Human-readable instruction for each capture step. */
export const POSE_PROMPTS: Record<FacePose, string> = {
  center: 'Look straight at the camera',
  left: 'Slowly turn your head to the left',
  right: 'Slowly turn your head to the right',
  up: 'Tilt your head slightly up',
  down: 'Tilt your head slightly down',
}

/** What the user should do about a frame that could not be used. */
export const ISSUE_PROMPTS: Record<FaceCaptureIssue, string> = {
  'no-face': 'No face detected — center your face in the frame',
  'multiple-faces': 'More than one face in view — make sure you are alone in frame',
  'too-far': 'Move a little closer to the camera',
  'low-quality': 'Too dark or too blurry — find better lighting and hold still',
  'wrong-pose': 'Hold the requested position',
}
