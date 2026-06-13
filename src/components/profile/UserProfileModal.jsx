import { useState, useRef } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../common/Avatar'
import { X, Camera, Save } from 'lucide-react'

export default function UserProfileModal({ user, onClose, isOwnProfile = false }) {
  const { currentUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  if (!user) return null

  async function handleSave() {
    if (!displayName.trim()) {
      setError('Display name cannot be empty.')
      return
    }
    try {
      setSaving(true)
      setError('')
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: displayName.trim(),
        bio: bio.trim(),
        updatedAt: serverTimestamp(),
      })
      setEditing(false)
    } catch {
      setError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }
    try {
      setSaving(true)
      const storageRef = ref(storage, `avatars/${currentUser.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateDoc(doc(db, 'users', currentUser.uid), {
        avatar: url,
        updatedAt: serverTimestamp(),
      })
    } catch {
      setError('Failed to upload avatar.')
    } finally {
      setSaving(false)
    }
  }

  const statusColors = {
    online: '#3ba55d',
    offline: '#747f8d',
    idle: '#faa61a',
    dnd: '#ed4245',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-tertiary)',
          borderRadius: 12,
          width: '100%',
          maxWidth: 400,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Banner */}
        <div style={{
          height: 80,
          background: 'linear-gradient(135deg, #5865f2 0%, #3ba55d 100%)',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(0,0,0,0.3)', border: 'none',
              borderRadius: '50%', width: 28, height: 28,
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar area */}
        <div style={{ padding: '0 16px', position: 'relative', marginBottom: 16 }}>
          <div style={{
            position: 'absolute',
            top: -36,
            left: 16,
          }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                name={user.displayName || user.username}
                avatar={user.avatar}
                size={72}
                status={user.status}
              />
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      border: 'none', borderRadius: '50%',
                      cursor: 'pointer', opacity: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'opacity 0.15s',
                      color: 'white',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <Camera size={20} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </div>
          </div>

          {isOwnProfile && !editing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '6px 16px', borderRadius: 4, border: 'none',
                  background: 'var(--color-bg-active)', color: 'var(--color-text-primary)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Profile info */}
        <div style={{ padding: '4px 16px 20px' }}>
          {error && (
            <p style={{ color: 'var(--color-danger)', fontSize: 13, marginBottom: 8 }}>{error}</p>
          )}

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Display Name</label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  maxLength={32}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>About Me</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={190}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'right', marginTop: 2 }}>
                  {bio.length}/190
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setEditing(false); setError('') }}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 4, border: 'none',
                    background: 'var(--color-bg-active)', color: 'var(--color-text-primary)',
                    fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 4, border: 'none',
                    background: 'var(--color-accent)', color: 'white',
                    fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {user.displayName || user.username}
                </h2>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: statusColors[user.status] || statusColors.offline,
                  flexShrink: 0,
                }} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                @{user.username}
              </p>

              {user.bio && (
                <div style={{
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 8, padding: '10px 12px',
                  marginBottom: 12,
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    About Me
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                    {user.bio}
                  </p>
                </div>
              )}

              <div style={{
                background: 'var(--color-bg-secondary)',
                borderRadius: 8, padding: '10px 12px',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  Member Since
                </p>
                <p style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
                  {user.createdAt?.toDate?.()?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) || 'Unknown'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-secondary)',
  display: 'block',
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  background: 'var(--color-bg-input)',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  padding: '8px 10px',
  fontSize: 15,
  color: 'var(--color-text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
}
