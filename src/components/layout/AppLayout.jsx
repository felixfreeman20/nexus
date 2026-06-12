import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Hash,
  ChevronDown,
  Mic,
  MicOff,
  Headphones,
} from 'lucide-react'

// Avatar helper — shows initials if no image
function Avatar({ name = '?', size = 32, online = false }) {
  const colors = [
    '#5865f2','#ed4245','#3ba55d','#faa61a',
    '#eb459e','#00aff4','#593695',
  ]
  const color = colors[(name.charCodeAt(0) || 0) % colors.length]
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.38,
        color: '#fff',
        flexShrink: 0,
        userSelect: 'none',
      }}>
        {initials}
      </div>
      {online !== null && (
        <span style={{
          position: 'absolute',
          bottom: -1,
          right: -1,
          width: size * 0.35,
          height: size * 0.35,
          borderRadius: '50%',
          background: online ? 'var(--color-success)' : 'var(--color-text-muted)',
          border: '2px solid var(--color-bg-secondary)',
        }} />
      )}
    </div>
  )
}

// Placeholder content panels for Phase 1 — replaced in Phase 2+
function WelcomePanel({ username }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      color: 'var(--color-text-secondary)',
      padding: 32,
    }}>
      <svg width="72" height="56" viewBox="0 0 127.14 96.36" fill="var(--color-bg-tertiary)">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
      </svg>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Welcome, {username}!
      </h2>
      <p style={{ fontSize: 14, textAlign: 'center', maxWidth: 320 }}>
        Nexus is ready. Friends, DMs, and chat are coming in the next phases.
      </p>
    </div>
  )
}

export default function AppLayout() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('home')
  const [muted, setMuted] = useState(false)
  const [deafened, setDeafened] = useState(false)

  const username = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch {
      // logout errors are non-fatal — navigate anyway
      navigate('/login')
    }
  }

  return (
    <div className="app-root">
      {/* Left sidebar: server/nav icons */}
      <aside className="server-sidebar">
        <div className="server-icon server-icon--home" title="Home"
          onClick={() => setActiveNav('home')}
          style={{ background: activeNav === 'home' ? 'var(--color-accent)' : '' }}>
          <svg width="24" height="18" viewBox="0 0 127.14 96.36" fill="currentColor">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
          </svg>
        </div>

        <div className="server-divider" />

        <div className="server-icon" title="Direct Messages"
          onClick={() => setActiveNav('dm')}
          style={{ background: activeNav === 'dm' ? 'var(--color-accent)' : '' }}>
          <MessageSquare size={22} />
        </div>

        <div className="server-icon" title="Friends"
          onClick={() => setActiveNav('friends')}
          style={{ background: activeNav === 'friends' ? 'var(--color-accent)' : '' }}>
          <Users size={22} />
        </div>
      </aside>

      {/* Secondary sidebar: channels / DM list */}
      <aside className="channel-sidebar">
        <div className="channel-sidebar-header">
          <span className="channel-sidebar-title">Nexus</span>
          <ChevronDown size={16} style={{ color: 'var(--color-text-secondary)' }} />
        </div>

        <div className="channel-section">
          <div className="channel-section-label">Direct Messages</div>
          <div className="channel-empty">
            <p>No conversations yet.</p>
            <p>Friends coming in Phase 2.</p>
          </div>
        </div>

        {/* User panel at bottom */}
        <div className="user-panel">
          <div className="user-panel-info">
            <Avatar name={username} size={32} online={true} />
            <div className="user-panel-names">
              <span className="user-panel-name">{username}</span>
              <span className="user-panel-status">Online</span>
            </div>
          </div>
          <div className="user-panel-controls">
            <button
              className="user-panel-btn"
              onClick={() => setMuted(m => !m)}
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              className="user-panel-btn"
              onClick={() => setDeafened(d => !d)}
              title={deafened ? 'Undeafen' : 'Deafen'}
            >
              <Headphones size={18} style={{ opacity: deafened ? 0.4 : 1 }} />
            </button>
            <button
              className="user-panel-btn"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="main-content">
        {/* Top bar */}
        <div className="main-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Hash size={20} style={{ color: 'var(--color-text-secondary)' }} />
            <span style={{ fontWeight: 600, fontSize: 16 }}>welcome</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="topbar-icon-btn" title="Settings" onClick={() => navigate('/settings')}>
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <WelcomePanel username={username} />
      </main>

      <style>{`
        .app-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--color-bg-secondary);
        }

        /* Server sidebar — far left, icon strip */
        .server-sidebar {
          width: 72px;
          min-width: 72px;
          background: var(--color-bg-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 0;
          gap: 8px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .server-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--color-bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: border-radius 0.15s, background 0.15s, color 0.15s;
          flex-shrink: 0;
        }

        .server-icon:hover {
          border-radius: 16px;
          background: var(--color-accent);
          color: white;
        }

        .server-icon--home {
          color: white;
        }

        .server-divider {
          width: 32px;
          height: 2px;
          background: var(--color-border);
          border-radius: 1px;
          margin: 4px 0;
        }

        /* Channel sidebar */
        .channel-sidebar {
          width: 240px;
          min-width: 240px;
          background: var(--color-bg-tertiary);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .channel-sidebar-header {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid var(--color-bg-secondary);
          cursor: pointer;
          flex-shrink: 0;
        }

        .channel-sidebar-header:hover {
          background: var(--color-bg-hover);
        }

        .channel-sidebar-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .channel-section {
          flex: 1;
          padding: 16px 8px;
          overflow-y: auto;
        }

        .channel-section-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
          padding: 0 8px;
          margin-bottom: 4px;
        }

        .channel-empty {
          padding: 12px 8px;
          font-size: 13px;
          color: var(--color-text-muted);
          line-height: 1.6;
        }

        /* User panel */
        .user-panel {
          height: 52px;
          background: var(--color-bg-secondary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          flex-shrink: 0;
        }

        .user-panel-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .user-panel-names {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .user-panel-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-panel-status {
          font-size: 11px;
          color: var(--color-success);
        }

        .user-panel-controls {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .user-panel-btn {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.1s, color 0.1s;
        }

        .user-panel-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        /* Main content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--color-bg-primary);
          overflow: hidden;
          min-width: 0;
        }

        .main-topbar {
          height: 48px;
          border-bottom: 1px solid var(--color-bg-secondary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          flex-shrink: 0;
        }

        .topbar-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.1s, color 0.1s;
        }

        .topbar-icon-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }
      `}</style>
    </div>
  )
}
