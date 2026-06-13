import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useFriends } from '../../hooks/useFriends'
import { usePresence } from '../../hooks/usePresence'
import { useConversations } from '../../hooks/useConversations'
import Avatar from '../common/Avatar'
import NexusLogo from '../common/NexusLogo'
import FriendsPage from '../friends/FriendsPage'
import DMPage from '../dm/DMPage'
import UserProfileModal from '../profile/UserProfileModal'
import { MessageSquare, Users, LogOut, Mic, MicOff, Headphones } from 'lucide-react'

export default function AppLayout() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const { incomingRequests } = useFriends()
  const { conversations, ensureConversation } = useConversations()
  const [activeNav, setActiveNav] = useState('friends')
  const [activeConversation, setActiveConversation] = useState(null)
  const [activeOtherUser, setActiveOtherUser] = useState(null)
  const [muted, setMuted] = useState(false)
  const [deafened, setDeafened] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

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

  async function handleOpenDM(friend) {
    const convId = await ensureConversation(friend)
    setActiveConversation({ id: convId })
    setActiveOtherUser(friend)
    setActiveNav('dm')
  }

  async function handleSelectConversation(conv) {
    const otherId = conv.participants.find(p => p !== currentUser?.uid)
    const otherProfile = conv.participantProfiles?.[otherId] || { uid: otherId, displayName: 'User', username: 'user', status: 'offline', avatar: null }
    setActiveConversation(conv)
    setActiveOtherUser(otherProfile)
    setActiveNav('dm')
  }

  async function handleLogout() {
    try { await logout() } catch {}
    navigate('/login')
  }

  function renderMain() {
    if (activeNav === 'friends') {
      return <FriendsPage onOpenDM={handleOpenDM} />
    }
    if (activeNav === 'dm') {
      return <DMPage conversation={activeConversation} otherUser={activeOtherUser} />
    }
    return null
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>

      {/* Server/nav strip */}
      <aside style={{
        width: 72, minWidth: 72, background: 'var(--color-bg-secondary)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '12px 0', gap: 8, overflowY: 'auto',
      }}>
        <NavIcon custom onClick={() => setActiveNav('friends')} active={activeNav === 'friends'} label="Home">
          <NexusLogo size={28} color={activeNav === 'friends' ? '#fff' : '#5865f2'} />
        </NavIcon>

        <div style={{ width: 32, height: 2, background: 'var(--color-border)', borderRadius: 1, margin: '4px 0' }} />

        <div style={{ position: 'relative' }}>
          <NavIcon icon={MessageSquare} label="Direct Messages" active={activeNav === 'dm'} onClick={() => setActiveNav('dm')} />
        </div>

        <div style={{ position: 'relative' }}>
          <NavIcon icon={Users} label="Friends" active={activeNav === 'friends'} onClick={() => setActiveNav('friends')} />
          {pendingCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              background: 'var(--color-danger)', color: 'white',
              borderRadius: '50%', width: 18, height: 18,
              fontSize: 11, fontWeight: 700, border: '2px solid var(--color-bg-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </div>
      </aside>

      {/* Channel / DM sidebar */}
      <aside style={{
        width: 240, minWidth: 240, background: 'var(--color-bg-tertiary)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          height: 48, display: 'flex', alignItems: 'center', padding: '0 16px',
          borderBottom: '1px solid var(--color-bg-secondary)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Direct Messages
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px' }}>
          {conversations.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '8px 12px' }}>
              No conversations yet.
            </p>
          ) : (
            conversations.map(conv => {
              const otherId = conv.participants?.find(p => p !== currentUser?.uid)
              const other = conv.participantProfiles?.[otherId] || {}
              const isActive = activeConversation?.id === conv.id
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
                    background: isActive ? 'var(--color-bg-active)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-bg-hover)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <Avatar name={other.displayName || 'User'} avatar={other.avatar} size={32} status={other.status} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {other.displayName || other.username || 'User'}
                    </div>
                    {conv.lastMessage && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.lastMessage}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* User panel */}
        <div style={{
          height: 52, background: 'var(--color-bg-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 8px', flexShrink: 0,
        }}>
          <div
            onClick={() => setShowProfile(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              flex: 1, minWidth: 0, cursor: 'pointer', padding: 4,
              borderRadius: 4, transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar name={username} avatar={currentUser?.photoURL} size={32} status="online" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {username}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-success)' }}>Online</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 2 }}>
            <UserPanelBtn icon={muted ? MicOff : Mic} label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted(m => !m)} active={muted} />
            <UserPanelBtn icon={Headphones} label="Deafen" onClick={() => setDeafened(d => !d)} active={deafened} />
            <UserPanelBtn icon={LogOut} label="Sign out" onClick={handleLogout} danger />
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

      {showProfile && (
        <UserProfileModal user={userDoc} isOwnProfile onClose={() => setShowProfile(false)} />
      )}
    </div>
  )
}

function NavIcon({ icon: Icon, label, active, onClick, custom, children }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      title={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 48, height: 48,
        borderRadius: active ? 16 : hov ? 16 : '50%',
        background: active ? 'var(--color-accent)' : hov ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        color: active || hov ? 'white' : 'var(--color-text-secondary)',
        transition: 'border-radius 0.15s, background 0.15s, color 0.15s',
      }}
    >
      {custom ? children : <Icon size={22} />}
    </div>
  )
}

function UserPanelBtn({ icon: Icon, label, onClick, active, danger }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      title={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 32, height: 32, borderRadius: 4, border: 'none',
        background: hov ? 'var(--color-bg-hover)' : 'transparent',
        color: danger ? 'var(--color-danger)' : active ? 'var(--color-danger)' : hov ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
      }}
    >
      <Icon size={18} />
    </button>
  )
}
