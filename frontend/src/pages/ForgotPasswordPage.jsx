import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail]           = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm]       = useState('')
  const [validated, setValidated]   = useState(false)
  const [success, setSuccess]       = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setValidated(true)
    if (!e.target.checkValidity()) return

    setSuccess('')
    setError('')

    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.resetPassword(email.trim(), newPassword.trim())
      setSuccess('Password reset successfully. You can now sign in with your new password.')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar bg-body-tertiary mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="/images/logo-transparent.png" alt="Auction Logo" height="40" />
          </Link>
          <Link className="btn btn-outline-secondary btn-sm ms-auto" to="/">
            Back to login
          </Link>
        </div>
      </nav>

      <main className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h1 className="h4 mb-1 fw-bold">Reset Password</h1>
                <p className="text-muted mb-4">Enter your account email and a new password.</p>

                {success && <div className="alert alert-success">{success}</div>}
                {error   && <div className="alert alert-danger">{error}</div>}

                <form
                  className={`needs-validation ${validated ? 'was-validated' : ''}`}
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email" className="form-control"
                      value={email} onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <div className="invalid-feedback">Please enter your email.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New password</label>
                    <input
                      type="password" className="form-control"
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      minLength={6} required
                    />
                    <div className="invalid-feedback">Password must be at least 6 characters.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm new password</label>
                    <input
                      type="password" className="form-control"
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      minLength={6} required
                    />
                    <div className="invalid-feedback">Passwords must match.</div>
                  </div>

                  <button className="btn btn-primary w-100" type="submit" disabled={loading || !!success}>
                    {loading ? 'Resetting…' : 'Reset Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
