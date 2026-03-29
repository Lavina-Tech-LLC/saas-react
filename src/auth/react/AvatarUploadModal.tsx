import { useState, useRef, useCallback } from 'react'
import { AvatarCropper } from './AvatarCropper'

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
    <div className="ss-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ss-modal">
        <div className="ss-modal-header">
          <span className="ss-modal-title">Upload Avatar</span>
          <button type="button" className="ss-modal-close" onClick={onClose}>
            &#x2715;
          </button>
        </div>

        {error && <div className="ss-global-error">{error}</div>}

        {!file ? (
          <div
            className={`ss-avatar-dropzone${dragOver ? ' ss-avatar-dropzone-active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" />
              <path d="M3 16.8V9.2c0-1.12 0-1.68.218-2.108a2 2 0 01.874-.874C4.52 6 5.08 6 6.2 6h.382c.246 0 .37 0 .482-.022a1 1 0 00.513-.29c.08-.082.148-.186.284-.392l.079-.118C8.08 4.968 8.15 4.863 8.234 4.77a2 2 0 01.965-.61C9.346 4.1 9.508 4.1 9.834 4.1h4.332c.326 0 .488 0 .636.06a2 2 0 01.965.61c.083.094.153.198.293.408l.079.118c.136.206.204.31.284.392a1 1 0 00.513.29c.112.022.236.022.482.022h.382c1.12 0 1.68 0 2.108.218a2 2 0 01.874.874C21 7.52 21 8.08 21 9.2v7.6c0 1.12 0 1.68-.218 2.108a2 2 0 01-.874.874C19.48 20 18.92 20 17.8 20H6.2c-1.12 0-1.68 0-2.108-.218a2 2 0 01-.874-.874C3 18.48 3 17.92 3 16.8z" />
            </svg>
            <span>Drop image here or click to browse</span>
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
        ) : (
          <AvatarCropper file={file} onCrop={handleCrop} onCancel={() => setFile(null)} />
        )}

        {isLoading && <div className="ss-loading">Uploading...</div>}
      </div>
    </div>
  )
}
