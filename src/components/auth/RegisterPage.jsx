import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import NexusLogo from '../common/NexusLogo'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function validate() {
    if (!email.trim()) return 'Email is required.'
    if (!username.trim()) return 'Username is required.'
    if (username.trim().length < 2) return 'Username must be at least 2 characters.'
    if (username.trim().length > 32) return 'Username must be 32 characters or less.'
    if (!/^[a-zA-Z0-9_.]+$/.test(username.trim())) return 'Username: letters, numbers, underscores, periods only.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (password !== confirm) return 'Passwords do not match.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    try {
      setError(''); setLoading(true)
      // Store username lowercase for searchability
      await register(email.trim(), password, username.trim().toLowerCase())
      navigate('/app')
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak.',
      }
      setError(messages[err.code] || 'Failed to create account. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <NexusLogo size={48} />
        </div>
        <h1 style={titleStyle}>Create an account</h1>
        <p style={subtitleStyle}>Join Nexus today.</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <Field label="Email" id="email" type="email" value={email} onChange={setEmail} autoComplete="email" autoFocus />
          <Field label="Username" id="username" type="text" value={username} onChange={setUsername} autoComplete="username" maxLength={32} />
          <Field label="Password" id="password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
          <Field label="Confirm Password" id="confirm" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />

          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? <span style={spinnerStyle} /> : 'Create Account'}
          </button>
        </form>

        <p style={footerStyle}>
          Already have an account?{' '}
          <Link to="/login" style={linkStyle}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, id, type, value, onChange, autoComplete, autoFocus, maxLength }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label htmlFor={id} style={labelStyle}>
        {label} <span style={{ color: 'var(--color-danger)' }}>*</span>
      </label>
      <input
        id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        style={inputStyle} autoComplete={autoComplete}
        autoFocus={autoFocus} maxLength={maxLength} required
      />
    </div>
  )
}

const pageStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', padding: 16 }
const cardStyle = { background: 'var(--color-bg-primary)', borderRadius: 8, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 2px 10px rgba(0,0,0,0.4)', textAlign: 'center' }
const titleStyle = { fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }
const subtitleStyle = { fontSize: 16, color: 'var(--color-text-secondary)', marginBottom: 20 }
const errorStyle = { background: 'rgba(237,66,69,0.1)', border: '1px solid var(--color-danger)', borderRadius: 4, padding: '10px 14px', marginBottom: 16, color: '#f38ba8', fontSize: 14, textAlign: 'left' }
const formStyle = { display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }
const labelStyle = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }
const inputStyle = { background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 4, padding: '10px 12px', fontSize: 16, color: 'var(--color-text-primary)', width: '100%', outline: 'none' }
const btnStyle = (loading) => ({ background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 4, padding: 12, fontSize: 16, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', width: '100%', marginTop: 8, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 44 })
const spinnerStyle = { width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }
const footerStyle = { marginTop: 20, fontSize: 14, color: 'var(--color-text-muted)' }
const linkStyle = { color: 'var(--color-text-link)', textDecoration: 'none' }
