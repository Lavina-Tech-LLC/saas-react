import { useState, useRef, useCallback } from 'react'
import { AvatarCropper } from './AvatarCropper'
import { ICONS } from '../../styles/icons'

interface AvatarUploadModalProps {
  onUpload: (blob: Blob) => Promise<void>
  onClose: () => void
  isLoading: boolean
}

export function AvatarUploadModal({ onUpload, onClose, isLoading }: AvatarUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB')
      return
    }
    setError(null)
    setFile(f)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const f = e.dataTransfer.files[0]
      if (f) acceptFile(f)
    },
    [acceptFile],
  )

  const handleCrop = useCallback(
    async (blob: Blob) => {
      await onUpload(blob)
    },
    [onUpload],
  )

  return (
    <div className="ss-auth-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ss-auth-modal ss-auth-card-wide">
        {/* Header */}
        <div className="ss-auth-modal-header">
          <h2>Upload avatar</h2>
          <button type="button" className="ss-auth-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">{ICONS.close}</span>
          </button>
        </div>

        {/* Body */}
        <div className="ss-auth-modal-body">
          {error && (
            <div className="ss-auth-error" style={{ marginBottom: '24px' }}>
              <span className="material-symbols-outlined">{ICONS.errorOutline}</span>
              <span>{error}</span>
            </div>
          )}

          <div className="ss-auth-upload-grid">
            {/* Left: Crop area or placeholder */}
            <div>
              {file ? (
                <AvatarCropper file={file} onCrop={handleCrop} onCancel={() => setFile(null)} />
              ) : (
                <div
                  className="ss-auth-crop-area"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    aspectRatio: '1',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>
                    {ICONS.image}
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.4 }}>No image selected</span>
                </div>
              )}
            </div>

            {/* Right: Dropzone + Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                className={`ss-auth-dropzone${dragOver ? ' ss-auth-dropzone-active' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ minHeight: '180px' }}
              >
                <div className="ss-auth-dropzone-icon">
                  <span className="material-symbols-outlined">{ICONS.cloudUpload}</span>
                </div>
                <span className="ss-auth-dropzone-title">Drag and drop</span>
                <span className="ss-auth-dropzone-desc">
                  JPG, PNG or WEBP<br />Max file size 5 MB
                </span>
                <button type="button" className="ss-auth-dropzone-btn">Choose File</button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) acceptFile(e.target.files[0])
                  }}
                />
              </div>

              <div className="ss-auth-info-box">
                <span className="material-symbols-outlined">{ICONS.info}</span>
                <span>Your profile photo will be visible to all members of your organization.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ss-auth-modal-footer">
          <button type="button" className="ss-auth-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ss-auth-btn-primary ss-auth-btn-sm"
            onClick={() => {
              // Trigger crop from parent if file exists - the crop is handled via AvatarCropper's onCrop
            }}
            disabled={!file || isLoading}
            style={{ width: 'auto' }}
          >
            {isLoading && <span className="ss-auth-spinner" />}
            Save Profile
            {!isLoading && <span className="material-symbols-outlined">{ICONS.check}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
