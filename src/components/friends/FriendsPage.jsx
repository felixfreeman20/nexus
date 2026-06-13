import { useState, useEffect, useRef } from 'react'
import { useFriends } from '../../hooks/useFriends'
import { useUserSearch } from '../../hooks/useUserSearch'
import Avatar from '../common/Avatar'
import {
  UserPlus, Check, X, Search, Users,
  Clock, UserMinus, MessageSquare,
} from 'lucide-react'

// Tab definitions
const TABS = [
  { id: 'online', label: 'Online' },
  { id: 'all', label: 'All Friends' },
  { id: 'pending', label: 'Pending' },
  { id: 'add', label: 'Add Friend', accent: true },
]

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      gap: 12,
      padding: 48,
      color: 'var(--color-text-muted)',
    }}>
      <Icon size={64} strokeWidth={1} />
      <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{title}</p>
      <p style={{ fontSize: 14, textAlign: 'center', maxWidth: 300 }}>{subtitle}</p>
    </div>
  )
}

function FriendRow({ user, actions }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 8,
        background: hovered ? 'var(--color-bg-hover)' : 'transparent',
        cursor: 'default',
        transition: 'background 0.1s',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <Avatar name={user.username || user.displayName} avatar={user.avatar} size={40} status={user.status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user.displayName || user.username}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {user.status === 'online' ? 'Online' : 'Offline'}
        </div>
      </div>
      {hovered && (
        <div style={{ display: 'flex', gap: 8 }}>
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              title={action.label}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: 'var(--color-bg-tertiary)',
                color: action.danger ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.1s, color 0.1s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = action.danger ? 'rgba(237,66,69,0.15)' : 'var(--color-bg-active)'
                e.currentTarget.style.color = action.danger ? 'var(--color-danger)' : 'var(--color-text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)'
                e.currentTarget.style.color = action.danger ? 'var(--color-danger)' : 'var(--color-text-secondary)'
              }}
            >
              <action.icon size={18} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RequestRow({ request, onAccept, onDecline, onCancel, type }) {
  const user = type === 'incoming' ? request.fromUser : request.toUser

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 8,
      borderTop: '1px solid var(--color-border)',
    }}>
      <Avatar name={user?.username || '?'} avatar={user?.avatar} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>
          {user?.displayName || user?.username}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {type === 'incoming' ? 'Incoming friend request' : 'Outgoing friend request'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {type === 'incoming' && (
          <button
            onClick={() => onAccept(request.requestId, request.fromUid)}
            title="Accept"
            style={actionBtnStyle('#3ba55d')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,165,93,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
          >
            <Check size={18} color="#3ba55d" />
          </button>
        )}
        <button
          onClick={() => type === 'incoming' ? onDecline(request.requestId) : onCancel(request.requestId)}
          title={type === 'incoming' ? 'Decline' : 'Cancel'}
          style={actionBtnStyle('var(--color-danger)')}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(237,66,69,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
        >
          <X size={18} color="var(--color-danger)" />
        </button>
      </div>
    </div>
  )
}

function actionBtnStyle() {
  return {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    background: 'var(--color-bg-tertiary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.1s',
  }
}

// Add Friend Panel
function AddFriendPanel() {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState(null) // { type: 'success'|'error', msg }
  const { results, searching, searchError, searchUsers, clearSearch } = useUserSearch()
  const { sendFriendRequest, friends, outgoingRequests } = useFriends()
  const debounceRef = useRef(null)

  function handleInput(val) {
    setInput(val)
    setStatus(null)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      searchUsers(val)
    }, 350)
  }

  async function handleSendRequest(uid) {
    try {
      await sendFriendRequest(uid)
      setStatus({ type: 'success', msg: 'Friend request sent!' })
    } catch (err) {
      setStatus({ type: 'error', msg: err.message })
    }
  }

  function isFriend(uid) {
    return friends.some(f => f.uid === uid)
  }

  function hasPendingRequest(uid) {
    return outgoingRequests.some(r => r.toUid === uid)
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 680 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
        Add Friend
      </h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
        Search by username to add friends.
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-bg-input)',
        border: `1px solid ${status?.type === 'error' ? 'var(--color-danger)' : status?.type === 'success' ? '#3ba55d' : 'var(--color-border)'}`,
        borderRadius: 8,
        padding: '0 16px',
        gap: 8,
        transition: 'border-color 0.15s',
      }}>
        <Search size={18} color="var(--color-text-muted)" />
        <input
          value={input}
          onChange={e => handleInput(e.target.value)}
          placeholder="Search by username..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '12px 0',
            fontSize: 16,
            color: 'var(--color-text-primary)',
          }}
        />
        {input && (
          <button
            onClick={() => { setInput(''); clearSearch(); setStatus(null) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {status && (
        <p style={{
          fontSize: 13,
          color: status.type === 'success' ? '#3ba55d' : 'var(--color-danger)',
          marginTop: 8,
        }}>
          {status.msg}
        </p>
      )}

      {searching && (
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 16 }}>Searching...</p>
      )}

      {searchError && (
        <p style={{ fontSize: 14, color: 'var(--color-danger)', marginTop: 16 }}>{searchError}</p>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Results — {results.length}
          </p>
          {results.map(user => {
            const alreadyFriend = isFriend(user.uid)
            const pending = hasPendingRequest(user.uid)
            return (
              <div key={user.uid} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--color-bg-tertiary)',
                marginBottom: 4,
              }}>
                <Avatar name={user.username} avatar={user.avatar} size={36} status={user.status} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
                    {user.displayName || user.username}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    @{user.username}
                  </div>
                </div>
                <button
                  onClick={() => !alreadyFriend && !pending && handleSendRequest(user.uid)}
                  disabled={alreadyFriend || pending}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 4,
                    border: 'none',
                    background: alreadyFriend ? 'var(--color-bg-active)' : pending ? 'var(--color-bg-active)' : 'var(--color-accent)',
                    color: alreadyFriend || pending ? 'var(--color-text-secondary)' : 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: alreadyFriend || pending ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {alreadyFriend ? 'Friends' : pending ? 'Pending' : 'Add Friend'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {!searching && !searchError && results.length === 0 && input.length >= 2 && (
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 16 }}>
          No users found matching "{input}".
        </p>
      )}
    </div>
  )
}

export default function FriendsPage({ onOpenDM }) {
  const [activeTab, setActiveTab] = useState('online')
  const {
    friends, incomingRequests, outgoingRequests, loading,
    acceptFriendRequest, declineFriendRequest,
    cancelFriendRequest, removeFriend,
  } = useFriends()

  const onlineFriends = friends.filter(f => f.status === 'online')
  const pendingCount = incomingRequests.length

  function renderContent() {
    if (loading) {
      return (
        <div style={{ padding: 24, color: 'var(--color-text-muted)', fontSize: 14 }}>
          Loading...
        </div>
      )
    }

    if (activeTab === 'add') return <AddFriendPanel />

    if (activeTab === 'pending') {
      const hasPending = incomingRequests.length > 0 || outgoingRequests.length > 0
      if (!hasPending) {
        return <EmptyState icon={Clock} title="No pending requests" subtitle="New friend requests will show up here." />
      }
      return (
        <div style={{ padding: '0 20px' }}>
          {incomingRequests.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={sectionLabelStyle}>Incoming — {incomingRequests.length}</p>
              {incomingRequests.map(r => (
                <RequestRow
                  key={r.requestId}
                  request={r}
                  type="incoming"
                  onAccept={acceptFriendRequest}
                  onDecline={declineFriendRequest}
                />
              ))}
            </div>
          )}
          {outgoingRequests.length > 0 && (
            <div>
              <p style={sectionLabelStyle}>Outgoing — {outgoingRequests.length}</p>
              {outgoingRequests.map(r => (
                <RequestRow
                  key={r.requestId}
                  request={r}
                  type="outgoing"
                  onCancel={cancelFriendRequest}
                />
              ))}
            </div>
          )}
        </div>
      )
    }

    const displayFriends = activeTab === 'online' ? onlineFriends : friends

    if (displayFriends.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title={activeTab === 'online' ? 'No friends online' : 'No friends yet'}
          subtitle={activeTab === 'online'
            ? 'All your friends are currently offline.'
            : 'Add some friends to get started!'}
        />
      )
    }

    return (
      <div style={{ padding: '0 20px' }}>
        <p style={sectionLabelStyle}>
          {activeTab === 'online' ? 'Online' : 'All Friends'} — {displayFriends.length}
        </p>
        {displayFriends.map(friend => (
          <FriendRow
            key={friend.uid}
            user={friend}
            actions={[
              {
                icon: MessageSquare,
                label: 'Message',
                onClick: () => onOpenDM && onOpenDM(friend),
              },
              {
                icon: UserMinus,
                label: 'Remove Friend',
                danger: true,
                onClick: () => removeFriend(friend.uid),
              },
            ]}
          />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        height: 48,
        borderBottom: '1px solid var(--color-bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 4,
        flexShrink: 0,
      }}>
        <Users size={20} color="var(--color-text-secondary)" style={{ marginRight: 8 }} />
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)', marginRight: 12 }}>
          Friends
        </span>
        <div style={{ width: 1, height: 24, background: 'var(--color-border)', marginRight: 12 }} />
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              border: 'none',
              background: activeTab === tab.id
                ? tab.accent ? 'var(--color-accent)' : 'var(--color-bg-active)'
                : 'transparent',
              color: activeTab === tab.id
                ? tab.accent ? 'white' : 'var(--color-text-primary)'
                : tab.accent ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.1s, color 0.1s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              position: 'relative',
            }}
            onMouseEnter={e => {
              if (activeTab !== tab.id) e.currentTarget.style.background = 'var(--color-bg-hover)'
            }}
            onMouseLeave={e => {
              if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'
            }}
          >
            {tab.label}
            {tab.id === 'pending' && pendingCount > 0 && (
              <span style={{
                background: 'var(--color-danger)',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 16 }}>
        {renderContent()}
      </div>
    </div>
  )
}

const sectionLabelStyle = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
  padding: '8px 0',
  marginBottom: 4,
}
