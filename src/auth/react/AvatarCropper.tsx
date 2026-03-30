import { useState, useRef, useEffect, useCallback } from 'react'
import { ICONS } from '../../styles/icons'

interface AvatarCropperProps {
  file: File
  onCrop: (blob: Blob) => void
  onCancel: () => void
}

const CANVAS_SIZE = 320
const CROP_RADIUS = 128

export function AvatarCropper({ file, onCrop, onCancel }: AvatarCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      imgRef.current = img
      setLoaded(true)
      setOffset({ x: 0, y: 0 })
      setZoom(1)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (!loaded || !imgRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const img = imgRef.current
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height) * zoom
    const w = img.width * scale
    const h = img.height * scale
    const x = (CANVAS_SIZE - w) / 2 + offset.x
    const y = (CANVAS_SIZE - h) / 2 + offset.y

    // Draw image
    ctx.save()
    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, x, y, w, h)
    ctx.restore()

    // Draw dimmed area outside circle
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Redraw image inside circle on top
    ctx.save()
    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, x, y, w, h)
    ctx.restore()

    // Circle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2)
    ctx.stroke()
  }, [zoom, offset, loaded])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true)
      dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [offset],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      setOffset({
        x: dragStart.current.ox + (e.clientX - dragStart.current.x),
        y: dragStart.current.oy + (e.clientY - dragStart.current.y),
      })
    },
    [dragging],
  )

  const handlePointerUp = useCallback(() => setDragging(false), [])

  const handleCrop = useCallback(() => {
    if (!imgRef.current) return
    const outCanvas = document.createElement('canvas')
    const diameter = CROP_RADIUS * 2
    outCanvas.width = diameter
    outCanvas.height = diameter
    const ctx = outCanvas.getContext('2d')
    if (!ctx) return

    const img = imgRef.current
    const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height) * zoom
    const w = img.width * scale
    const h = img.height * scale
    const x = (CANVAS_SIZE - w) / 2 + offset.x - (CANVAS_SIZE / 2 - CROP_RADIUS)
    const y = (CANVAS_SIZE - h) / 2 + offset.y - (CANVAS_SIZE / 2 - CROP_RADIUS)

    ctx.beginPath()
    ctx.arc(CROP_RADIUS, CROP_RADIUS, CROP_RADIUS, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, x, y, w, h)

    outCanvas.toBlob((blob) => {
      if (blob) onCrop(blob)
    }, 'image/png')
  }, [zoom, offset, onCrop])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <div className="ss-auth-crop-area">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ cursor: dragging ? 'grabbing' : 'grab', width: '100%', height: '100%' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div className="ss-auth-crop-size-badge">256 x 256 px</div>
      </div>

      <div className="ss-auth-zoom-control" style={{ width: '100%', maxWidth: '280px' }}>
        <span className="material-symbols-outlined">{ICONS.zoomOut}</span>
        <input
          type="range"
          min="1"
          max="3"
          step="0.01"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="ss-auth-zoom-slider"
        />
        <span className="material-symbols-outlined">{ICONS.zoomIn}</span>
      </div>
    </div>
  )
}
