import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function LoginPage() {
  const { login, userId } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [validated, setValidated] = useState(false)

  if (userId) return <Navigate to="/catalogue" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setValidated(true)
    if (!e.target.checkValidity()) return
    setError('')
    setLoading(true)
    try {
      const user = await api.login(email.trim(), password.trim())
      login(user)
      navigate('/catalogue')
    } catch {
      setError('Invalid email or password.')
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
        </div>
      </nav>

      <div className="container">
        <header className="py-4 text-center">
          <h1 className="fw-bold">Auction System</h1>
          <p className="text-muted mb-0">Sign in to continue</p>
        </header>

        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <form
                  className={`needs-validation ${validated ? 'was-validated' : ''}`}
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <div className="invalid-feedback">Please enter your email.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <div className="invalid-feedback">Please enter your password.</div>
                  </div>

                  <div className="mb-3 d-flex justify-content-end">
                    <Link to="/forgot-password" className="small">Forgot password?</Link>
                  </div>

                  <button className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>

                  {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
                </form>

                <hr />
                <div className="text-center">
                  <Link to="/signup" className="link-primary">Create a new account</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
