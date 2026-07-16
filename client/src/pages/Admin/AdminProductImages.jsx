import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiUpload, FiTrash2, FiImage, FiExternalLink, FiSave, FiX, FiMaximize2
} from 'react-icons/fi'

const IMAGE_SLOTS = [
  { key: 'image',        label: 'Main Image',    emoji: '🎯', desc: 'Primary product photo shown everywhere' },
  { key: 'imageLeft',    label: 'Left Side',     emoji: '◀', desc: 'Left angle of the product' },
  { key: 'imageRight',   label: 'Right Side',    emoji: '▶', desc: 'Right angle of the product' },
  { key: 'imageTop',     label: 'Top View',      emoji: '⬆', desc: 'Top-down view of the product' },
  { key: 'imagePackage', label: 'Package',       emoji: '📦', desc: 'Packaging / label close-up' },
]

const Lightbox = ({ src, alt, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.92)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      cursor: 'zoom-out', backdropFilter: 'blur(6px)',
    }}
  >
    <button
      onClick={onClose}
      style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.12)', border: 'none',
        color: '#fff', borderRadius: 12, padding: 10, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    ><FiX size={22} /></button>
    <img
      src={src} alt={alt}
      style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
      onClick={e => e.stopPropagation()}
    />
  </div>
)

const actionBtn = (color, bg) => ({
  background: bg, color, border: 'none', borderRadius: 10,
  padding: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.15s',
})

const pillBtn = (bg, color) => ({
  display: 'flex', alignItems: 'center', gap: 6,
  background: bg, color, border: 'none', borderRadius: 10,
  padding: '8px 16px', fontSize: 12, fontWeight: 700,
  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font)',
})

const ImageCard = ({ slot, value, onChange, onDelete, onPreview }) => {
  const [uploading, setUploading] = useState(false)
  const [editingUrl, setEditingUrl] = useState(false)
  const [urlDraft, setUrlDraft] = useState(value || '')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFileChange = async (file) => {
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('image', file)
    try {
      const res = await api.post('/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      onChange(slot.key, res.data.url)
      setUrlDraft(res.data.url)
      toast.success(slot.label + ' uploaded!')
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileChange(file)
  }

  const handleUrlSave = () => {
    onChange(slot.key, urlDraft.trim())
    setEditingUrl(false)
  }

  const hasImage = !!value

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1.5px solid ' + (dragging ? 'var(--brand-secondary)' : hasImage ? 'rgba(245,166,35,0.3)' : 'var(--border-color)'),
        borderRadius: 20, overflow: 'hidden', transition: 'all 0.2s', position: 'relative',
        boxShadow: dragging ? '0 0 0 4px rgba(245,166,35,0.2)' : hasImage ? 'var(--shadow-sm)' : 'none',
      }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div style={{
        height: 200, background: hasImage ? '#f8f8f8' : 'var(--bg-alt)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {hasImage ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img src={value} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div
              className="img-overlay"
              style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, opacity: 0, transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0'}
            >
              <button onClick={() => onPreview(value, slot.label)} style={actionBtn('#fff', 'rgba(255,255,255,0.2)')}>
                <FiMaximize2 size={16} />
              </button>
              <label style={{ ...actionBtn('var(--brand-secondary)', 'rgba(245,166,35,0.2)'), cursor: 'pointer' }}>
                <FiUpload size={16} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files[0])} ref={inputRef} />
              </label>
              <button onClick={() => { onDelete(slot.key); setUrlDraft('') }} style={actionBtn('#f87171', 'rgba(248,113,113,0.2)')}>
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{slot.emoji}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: 0 }}>
              {dragging ? 'Drop to upload' : 'No image yet'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: '4px 0 0', opacity: 0.7 }}>
              Drag and drop or click below
            </p>
          </div>
        )}

        {uploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(245,166,35,0.3)', borderTopColor: 'var(--brand-secondary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Uploading...</span>
          </div>
        )}

        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          borderRadius: 8, padding: '3px 9px', color: '#fff', fontSize: 11, fontWeight: 700,
        }}>{slot.label}</div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 12px', fontWeight: 500 }}>{slot.desc}</p>

        {editingUrl ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url" value={urlDraft} onChange={e => setUrlDraft(e.target.value)}
              placeholder="https://..." autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleUrlSave(); if (e.key === 'Escape') setEditingUrl(false) }}
              style={{
                flex: 1, border: '1.5px solid var(--brand-secondary)', borderRadius: 10,
                padding: '8px 12px', fontSize: 12, outline: 'none',
                background: 'var(--bg-surface)', color: 'var(--text-primary)', fontFamily: 'var(--font)',
              }}
            />
            <button onClick={handleUrlSave} style={{ ...pillBtn('var(--brand-secondary)', 'var(--navy)'), padding: '8px 14px', fontSize: 12 }}>Save</button>
            <button onClick={() => setEditingUrl(false)} style={{ ...pillBtn('var(--bg-alt)', 'var(--text-muted)'), padding: '8px 10px', fontSize: 12 }}><FiX size={14} /></button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <label style={{ ...pillBtn('rgba(245,166,35,0.12)', 'var(--brand-secondary)'), flex: 1, justifyContent: 'center', cursor: 'pointer' }}>
              <FiUpload size={13} /> Upload
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files[0])} disabled={uploading} />
            </label>
            <button onClick={() => { setUrlDraft(value || ''); setEditingUrl(true) }} style={{ ...pillBtn('var(--bg-alt)', 'var(--text-muted)'), flex: 1, justifyContent: 'center' }}>
              <FiExternalLink size={13} /> URL
            </button>
            {hasImage && (
              <button onClick={() => { onDelete(slot.key); setUrlDraft('') }} style={{ ...pillBtn('rgba(239,68,68,0.1)', '#ef4444'), padding: '8px 12px' }}>
                <FiTrash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const AdminProductImages = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasPermission, loading: authLoading } = useAuth()

  const [product, setProduct] = useState(null)
  const [images, setImages] = useState({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (authLoading) return
    const fetchProduct = async () => {
      try {
        const res = await api.get('/api/products/' + id)
        setProduct(res.data)
        setImages({
          image:        res.data.image || '',
          imageLeft:    res.data.imageLeft || '',
          imageRight:   res.data.imageRight || '',
          imageTop:     res.data.imageTop || '',
          imagePackage: res.data.imagePackage || '',
        })
      } catch {
        toast.error('Failed to load product')
        navigate('/admin/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, authLoading])

  const handleChange = (key, url) => {
    setImages(prev => ({ ...prev, [key]: url }))
    setHasChanges(true)
  }

  const handleDelete = (key) => {
    setImages(prev => ({ ...prev, [key]: '' }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/api/products/' + id, images)
      setHasChanges(false)
      toast.success('Images saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (!authLoading && !hasPermission('products')) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Access denied.</p>
      </div>
    )
  }

  if (loading || authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border-color)', borderTopColor: 'var(--brand-secondary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    )
  }

  const filledCount = Object.values(images).filter(Boolean).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}

      {/* Header */}
      <div style={{ background: 'var(--gradient-hero)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate('/admin/products')}
              style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: 12, padding: 10, cursor: 'pointer', display: 'flex' }}
            ><FiArrowLeft size={18} /></button>
            <div>
              <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)' }}>Product Images</h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: '2px 0 0' }}>
                {product?.name} &middot; {filledCount}/5 images
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {IMAGE_SLOTS.map(s => (
                <div key={s.key} title={s.label} style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: images[s.key] ? 'var(--brand-secondary)' : 'rgba(255,255,255,0.2)',
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: hasChanges ? 'var(--brand-secondary)' : 'rgba(255,255,255,0.15)',
                color: hasChanges ? 'var(--navy)' : 'rgba(255,255,255,0.4)',
                border: 'none', borderRadius: 12, padding: '10px 22px',
                fontSize: 14, fontWeight: 700, cursor: hasChanges && !saving ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: hasChanges ? '0 4px 14px rgba(245,166,35,0.4)' : 'none',
              }}
            >
              {saving
                ? <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <FiSave size={15} />}
              {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'All Saved'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Product Summary */}
        {product && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 16, padding: '16px 20px', marginBottom: 32,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-alt)', flexShrink: 0 }}>
              {images.image
                ? <img src={images.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiImage size={22} color="var(--text-muted)" /></div>}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{product.name}</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Rs {product.price} &middot; {product.category} &middot; {filledCount} of 5 slots filled
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {IMAGE_SLOTS.map(s => (
                <div key={s.key} title={s.label} style={{
                  width: 36, height: 36, borderRadius: 10, overflow: 'hidden',
                  border: '1.5px solid ' + (images[s.key] ? 'rgba(245,166,35,0.4)' : 'var(--border-color)'),
                  background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {images[s.key]
                    ? <img src={images[s.key]} alt={s.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 14, opacity: 0.5 }}>{s.emoji}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {IMAGE_SLOTS.map(slot => (
            <ImageCard
              key={slot.key}
              slot={slot}
              value={images[slot.key]}
              onChange={handleChange}
              onDelete={handleDelete}
              onPreview={(src, alt) => setLightbox({ src, alt })}
            />
          ))}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 32, lineHeight: 1.7 }}>
          Tip: Drag and drop images onto a card to upload instantly &middot; Click Save Changes to persist edits
        </p>
      </div>

      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )
}

export default AdminProductImages
