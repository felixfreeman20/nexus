import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useMessages } from '../../hooks/useMessages'
import { useTyping } from '../../hooks/useTyping'
import Avatar from '../common/Avatar'
import { Send, Edit2, Trash2, Check, X, Hash } from 'lucide-react'

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function MessageBubble({ message, isOwn, onEdit, onDelete, prevSenderId }) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(message.text)
  const editRef = useRef(null)

  const isGrouped = prevSenderId === message.senderId

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus()
      editRef.current.setSelectionRange(editText.length, editText.length)
    }
  }, [editing])

  function handleEditSubmit() {
    if (editText.trim() && editText.trim() !== message.text) {
      onEdit(message.id, editText)
    }
    setEditing(false)
  }

  function handleEditKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSubmit() }
    if (e.key === 'Escape') { setEditing(false); setEditText(message.text) }
  }

  if (message.deleted) {
    return (
      <div style={{ padding: isGrouped ? '1px 16px' : '8px 16px 1px', opacity: 0.4 }}>
        {!isGrouped && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 2 }}>
            <div style={{ width: 40, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Message deleted
            </span>
          </div>
        )}
        {isGrouped && (
          <div style={{ paddingLeft: 52, fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Message deleted
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: isGrouped ? '1px 16px' : '8px 16px 1px',
        background: hovered ? 'var(--color-bg-hover)' : 'transparent',
        transition: 'background 0.1s',
        position: 'relative',
      }}
    >
      {!isGrouped && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Avatar
            name={message.senderName}
            size={40}
            style={{ flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>
                {message.senderName}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {formatTime(message.createdAt)}
              </span>
            </div>
            {editing ? (
              <EditInput
                ref={editRef}
                value={editText}
                onChange={setEditText}
                onKeyDown={handleEditKeyDown}
                onSubmit={handleEditSubmit}
                onCancel={() => { setEditing(false); setEditText(message.text) }}
              />
            ) : (
              <p style={{ fontSize: 15, color: 'var(--color-text-primary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                {message.text}
                {message.editedAt && (
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 6 }}>(edited)</span>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {isGrouped && !editing && (
        <div style={{ paddingLeft: 52 }}>
          {hovered && (
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 40, textAlign: 'right' }}>
              {formatTime(message.createdAt).split(' ').pop()}
            </span>
          )}
          <p style={{ fontSize: 15, color: 'var(--color-text-primary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
            {message.text}
            {message.editedAt && (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 6 }}>(edited)</span>
            )}
          </p>
        </div>
      )}

      {isGrouped && editing && (
        <div style={{ paddingLeft: 52 }}>
          <EditInput
            ref={editRef}
            value={editText}
            onChange={setEditText}
            onKeyDown={handleEditKeyDown}
            onSubmit={handleEditSubmit}
            onCancel={() => { setEditing(false); setEditText(message.text) }}
          />
        </div>
      )}

      {/* Action buttons on hover */}
      {hovered && isOwn && !editing && !message.deleted && (
        <div style={{
          position: 'absolute', top: -16, right: 16,
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border)',
          borderRadius: 6, display: 'flex', gap: 2, padding: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 10,
        }}>
          <ActionBtn icon={Edit2} label="Edit" onClick={() => setEditing(true)} />
          <ActionBtn icon={Trash2} label="Delete" danger onClick={() => onDelete(message.id)} />
        </div>
      )}
    </div>
  )
}

const EditInput = ({ value, onChange, onKeyDown, onSubmit, onCancel, ...props }, ref) => (
  <div>
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      rows={Math.min(5, value.split('\n').length)}
      style={{
        width: '100%', background: 'var(--color-bg-input)',
        border: '1px solid var(--color-accent)', borderRadius: 6,
        padding: '8px 12px', fontSize: 15, color: 'var(--color-text-primary)',
        outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5,
        boxSizing: 'border-box',
      }}
    />
    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, display: 'flex', gap: 8 }}>
      <span>escape to <button onClick={onCancel} style={inlineBtnStyle}>cancel</button></span>
      <span>· enter to <button onClick={onSubmit} style={inlineBtnStyle}>save</button></span>
    </div>
  </div>
)
const EditInputWithRef = EditInput

function ActionBtn({ icon: Icon, label, onClick, danger }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      title={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 28, height: 28, borderRadius: 4, border: 'none',
        background: hov ? (danger ? 'rgba(237,66,69,0.15)' : 'var(--color-bg-hover)') : 'transparent',
        color: danger ? 'var(--color-danger)' : hov ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
      }}
    >
      <Icon size={14} />
    </button>
  )
}

const inlineBtnStyle = {
  background: 'none', border: 'none', color: 'var(--color-accent)',
  cursor: 'pointer', padding: 0, fontSize: 12, fontFamily: 'inherit',
}

export default function DMPage({ conversation, otherUser }) {
  const { currentUser } = useAuth()
  const { messages, loading, sendMessage, editMessage, deleteMessage } = useMessages(conversation?.id)
  const { setTyping, typingText } = useTyping(conversation?.id)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on conversation change
  useEffect(() => {
    inputRef.current?.focus()
  }, [conversation?.id])

  async function handleSend() {
    if (!input.trim() || sending) return
    const text = input
    setInput('')
    setSending(true)
    try {
      await sendMessage(text)
    } catch (err) {
      console.error('Send failed:', err)
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value)
    if (e.target.value.trim()) setTyping()
  }

  if (!conversation || !otherUser) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-muted)', gap: 16,
      }}>
        <Hash size={64} strokeWidth={1} />
        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
          No conversation selected
        </p>
        <p style={{ fontSize: 14 }}>Pick a friend from the sidebar to start chatting.</p>
      </div>
    )
  }

  const displayName = otherUser.displayName || otherUser.username || 'User'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar */}
      <div style={{
        height: 48, borderBottom: '1px solid var(--color-bg-secondary)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, flexShrink: 0,
      }}>
        <Avatar name={displayName} avatar={otherUser.avatar} size={28} status={otherUser.status} />
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)' }}>
          {displayName}
        </span>
        <span style={{
          fontSize: 12, color: otherUser.status === 'online' ? 'var(--color-success)' : 'var(--color-text-muted)',
          marginLeft: 4,
        }}>
          {otherUser.status === 'online' ? '● Online' : '● Offline'}
        </span>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 16, paddingBottom: 8 }}>
        {loading ? (
          <div style={{ padding: 24, color: 'var(--color-text-muted)', fontSize: 14 }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: 48, gap: 12, color: 'var(--color-text-muted)',
          }}>
            <Avatar name={displayName} avatar={otherUser.avatar} size={64} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 8 }}>
              {displayName}
            </h3>
            <p style={{ fontSize: 14, textAlign: 'center' }}>
              This is the beginning of your conversation with {displayName}.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUser?.uid}
              prevSenderId={i > 0 ? messages[i - 1].senderId : null}
              onEdit={editMessage}
              onDelete={deleteMessage}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <div style={{ height: 24, padding: '0 16px', flexShrink: 0 }}>
        {typingText && (
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            <TypingDots /> {typingText}
          </span>
        )}
      </div>

      {/* Input area */}
      <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          background: 'var(--color-bg-tertiary)',
          borderRadius: 8, padding: '8px 12px',
          border: '1px solid var(--color-border)',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${displayName}`}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 15, color: 'var(--color-text-primary)', resize: 'none',
              fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 120, overflow: 'auto',
              padding: '2px 0',
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              width: 36, height: 36, borderRadius: 6, border: 'none', flexShrink: 0,
              background: input.trim() ? 'var(--color-accent)' : 'transparent',
              color: input.trim() ? 'white' : 'var(--color-text-muted)',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center', marginRight: 4 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: '50%',
          background: 'var(--color-text-secondary)',
          display: 'inline-block',
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </span>
  )
}
