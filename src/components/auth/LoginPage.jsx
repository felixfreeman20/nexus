import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import NexusLogo from '../common/NexusLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return }
    try {
      setError(''); setLoading(true)
      await login(email.trim(), password)
      navigate('/app')
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'No account found with that email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
      }
      setError(messages[err.code] || 'Failed to sign in. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <NexusLogo size={48} />
        </div>
        <h1 style={titleStyle}>Welcome back!</h1>
        <p style={subtitleStyle}>Sign in to continue to Nexus.</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Email <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} autoComplete="email" autoFocus required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Password <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={inputStyle} autoComplete="current-password" required />
          </div>
          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? <span style={spinnerStyle} /> : 'Log In'}
          </button>
        </form>

        <p style={footerStyle}>
          Need an account?{' '}
          <Link to="/register" style={linkStyle}>Register</Link>
        </p>
      </div>
    </div>
  )
}

const pageStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', padding: 16 }
const cardStyle = { background: 'var(--color-bg-primary)', borderRadius: 8, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 2px 10px rgba(0,0,0,0.4)', textAlign: 'center' }
const titleStyle = { fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }
const subtitleStyle = { fontSize: 16, color: 'var(--color-text-secondary)', marginBottom: 20 }
const errorStyle = { background: 'rgba(237,66,69,0.1)', border: '1px solid var(--color-danger)', borderRadius: 4, padding: '10px 14px', marginBottom: 16, color: '#f38ba8', fontSize: 14, textAlign: 'left' }
const formStyle = { display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 8 }
const labelStyle = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }
const inputStyle = { background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 4, padding: '10px 12px', fontSize: 16, color: 'var(--color-text-primary)', width: '100%', outline: 'none' }
const btnStyle = (loading) => ({ background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 4, padding: 12, fontSize: 16, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', width: '100%', marginTop: 8, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 44 })
const spinnerStyle = { width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }
const footerStyle = { marginTop: 20, fontSize: 14, color: 'var(--color-text-muted)' }
const linkStyle = { color: 'var(--color-text-link)', textDecoration: 'none' }
