import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useFriends } from '../../hooks/useFriends'
import { usePresence } from '../../hooks/usePresence'
import Avatar from '../common/Avatar'
import NexusLogo from '../common/NexusLogo'
import FriendsPage from '../friends/FriendsPage'
import UserProfileModal from '../profile/UserProfileModal'
import {
  MessageSquare, Users, Settings,
  LogOut, Mic, MicOff, Headphones, Hash,
} from 'lucide-react'

export default function AppLayout() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const { incomingRequests } = useFriends()
  const [activeNav, setActiveNav] = useState('friends')
  const [muted, setMuted] = useState(false)
  const [deafened, setDeafened] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Register presence tracking
  usePresence()

  const username = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'
  const pendingCount = incomingRequests.length

  const userDoc = {
    uid: currentUser?.uid,
    username: username.toLowerCase().replace(/\s+/g, ''),
    displayName: username,
    avatar: currentUser?.photoURL || null,
    status: 'online',
    bio: '',
    createdAt: null,
  }

  async function handleLogout() {
    try { await logout() } catch {}
    navigate('/login')
  }

  function renderMain() {
    if (activeNav === 'friends') {
      return <FriendsPage onOpenDM={(friend) => console.log('DM', friend)} />
    }
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-muted)', gap: 12,
      }}>
        <Hash size={48} strokeWidth={1} />
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Coming in Phase 3
        </p>
        <p style={{ fontSize: 14 }}>Direct messages are up next.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>

      {/* Server/nav strip */}
      <aside style={{
        width: 72, minWidth: 72,
        background: 'var(--color-bg-secondary)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '12px 0', gap: 8,
        overflowY: 'auto', overflowX: 'hidden',
      }}>
        {/* Nexus home icon */}
        <div
          onClick={() => setActiveNav('friends')}
          title="Home"
          style={{
            width: 48, height: 48, borderRadius: activeNav === 'friends' ? 16 : '50%',
            background: activeNav === 'friends' ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'border-radius 0.15s, background 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            if (activeNav !== 'friends') {
              e.currentTarget.style.borderRadius = '16px'
              e.currentTarget.style.background = 'var(--color-accent)'
            }
          }}
          onMouseLeave={e => {
            if (activeNav !== 'friends') {
              e.currentTarget.style.borderRadius = '50%'
              e.currentTarget.style.background = 'var(--color-bg-tertiary)'
            }
          }}
        >
          <NexusLogo size={28} color={activeNav === 'friends' ? '#fff' : '#5865f2'} />
        </div>

        <div style={{ width: 32, height: 2, background: 'var(--color-border)', borderRadius: 1, margin: '4px 0' }} />

        {/* DMs */}
        <NavIcon
          icon={MessageSquare}
          label="Direct Messages"
          active={activeNav === 'dm'}
          onClick={() => setActiveNav('dm')}
        />

        {/* Friends */}
        <div style={{ position: 'relative' }}>
          <NavIcon
            icon={Users}
            label="Friends"
            active={activeNav === 'friends'}
            onClick={() => setActiveNav('friends')}
          />
          {pendingCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              background: 'var(--color-danger)', color: 'white',
              borderRadius: '50%', width: 18, height: 18,
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--color-bg-secondary)',
              pointerEvents: 'none',
            }}>
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </div>
      </aside>

      {/* Channel sidebar */}
      <aside style={{
        width: 240, minWidth: 240,
        background: 'var(--color-bg-tertiary)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          height: 48, display: 'flex', alignItems: 'center',
          padding: '0 16px', borderBottom: '1px solid var(--color-bg-secondary)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Nexus
          </span>
        </div>

        <div style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: 'var(--color-text-muted)',
            padding: '0 8px', marginBottom: 4,
          }}>
            Direct Messages
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '8px 8px' }}>
            No conversations yet.
          </p>
        </div>

        {/* User panel */}
        <div style={{
          height: 52, background: 'var(--color-bg-secondary)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 8px', flexShrink: 0,
        }}>
          <div
            onClick={() => setShowProfile(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              flex: 1, minWidth: 0, cursor: 'pointer', padding: '4px',
              borderRadius: 4, transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar name={username} avatar={currentUser?.photoURL} size={32} status="online" />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {username}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-success)' }}>Online</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 2 }}>
            <UserPanelBtn
              icon={muted ? MicOff : Mic}
              label={muted ? 'Unmute' : 'Mute'}
              onClick={() => setMuted(m => !m)}
              active={muted}
            />
            <UserPanelBtn
              icon={Headphones}
              label={deafened ? 'Undeafen' : 'Deafen'}
              onClick={() => setDeafened(d => !d)}
              active={deafened}
            />
            <UserPanelBtn
              icon={LogOut}
              label="Sign out"
              onClick={handleLogout}
              danger
            />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: 'var(--color-bg-primary)', overflow: 'hidden', minWidth: 0,
      }}>
        {renderMain()}
      </main>

      {/* Profile modal */}
      {showProfile && (
        <UserProfileModal
          user={userDoc}
          isOwnProfile
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  )
}

function NavIcon({ icon: Icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      title={label}
      style={{
        width: 48, height: 48,
        borderRadius: active ? 16 : '50%',
        background: active ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        color: active ? 'white' : 'var(--color-text-secondary)',
        transition: 'border-radius 0.15s, background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.borderRadius = '16px'
          e.currentTarget.style.background = 'var(--color-accent)'
          e.currentTarget.style.color = 'white'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.borderRadius = '50%'
          e.currentTarget.style.background = 'var(--color-bg-tertiary)'
          e.currentTarget.style.color = 'var(--color-text-secondary)'
        }
      }}
    >
      <Icon size={22} />
    </div>
  )
}

function UserPanelBtn({ icon: Icon, label, onClick, active, danger }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 32, height: 32, borderRadius: 4, border: 'none',
        background: 'transparent',
        color: danger ? 'var(--color-danger)' : active ? 'var(--color-danger)' : 'var(--color-text-secondary)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--color-bg-hover)'
        e.currentTarget.style.color = danger ? 'var(--color-danger)' : 'var(--color-text-primary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = danger ? 'var(--color-danger)' : active ? 'var(--color-danger)' : 'var(--color-text-secondary)'
      }}
    >
      <Icon size={18} />
    </button>
  )
}
