import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

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
    if (!/^[a-zA-Z0-9_.]+$/.test(username.trim()))
      return 'Username can only contain letters, numbers, underscores, and periods.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (password !== confirm) return 'Passwords do not match.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    try {
      setError('')
      setLoading(true)
      await register(email.trim(), password, username.trim())
      navigate('/app')
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
      }
      setError(messages[err.code] || 'Failed to create account. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="32" height="32" viewBox="0 0 127.14 96.36" fill="#5865f2">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
          </svg>
        </div>

        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Join Nexus today.</p>

        {error && (
          <div className="auth-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="username" className="auth-label">
              Username <span className="required">*</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              autoComplete="username"
              maxLength={32}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">
              Password <span className="required">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm" className="auth-label">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="auth-input"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn-primary"
          >
            {loading ? <span className="auth-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-secondary);
          padding: 16px;
        }
        .auth-card {
          background: var(--color-bg-primary);
          border-radius: 8px;
          padding: 32px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.4);
          text-align: center;
        }
        .auth-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        .auth-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 8px;
        }
        .auth-subtitle {
          font-size: 16px;
          color: var(--color-text-secondary);
          margin-bottom: 20px;
        }
        .auth-error {
          background: rgba(237, 66, 69, 0.1);
          border: 1px solid var(--color-danger);
          border-radius: 4px;
          padding: 10px 14px;
          margin-bottom: 16px;
          color: #f38ba8;
          font-size: 14px;
          text-align: left;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .auth-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
        }
        .required { color: var(--color-danger); }
        .auth-input {
          background: var(--color-bg-input);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          padding: 10px 12px;
          font-size: 16px;
          color: var(--color-text-primary);
          width: 100%;
          transition: border-color 0.15s;
          outline: none;
        }
        .auth-input:focus { border-color: var(--color-accent); }
        .auth-btn-primary {
          background: var(--color-accent);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 12px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          margin-top: 8px;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
        }
        .auth-btn-primary:hover:not(:disabled) { background: var(--color-accent-hover); }
        .auth-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-footer {
          margin-top: 20px;
          font-size: 14px;
          color: var(--color-text-muted);
        }
        .auth-link { color: var(--color-text-link); text-decoration: none; }
        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  )
}
