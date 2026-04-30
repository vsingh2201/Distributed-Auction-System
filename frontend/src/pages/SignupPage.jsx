import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const EMPTY = {
  email: '', password: '',
  firstName: '', lastName: '',
  streetName: '', streetNumber: '', city: '', country: '', postalCode: '',
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm]         = useState(EMPTY)
  const [validated, setValidated] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setValidated(true)
    if (!e.target.checkValidity()) return
    setError('')
    setLoading(true)
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim()
      await api.signup({
        name:     fullName,
        email:    form.email.trim(),
        username: form.email.trim(),
        password: form.password.trim(),
        address: {
          streetNumber: form.streetNumber.trim(),
          streetName:   form.streetName.trim(),
          city:         form.city.trim(),
          country:      form.country.trim(),
          postalCode:   form.postalCode.trim(),
        },
      })
      setSuccess(true)
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      setError(err.message || 'Sign-up failed. Please check your inputs and try again.')
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
            Back to Login
          </Link>
        </div>
      </nav>

      <main className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h1 className="h3 mb-1 fw-bold">Create Account</h1>
                <p className="text-muted mb-4">Register to start bidding and listing items.</p>

                {success && (
                  <div className="alert alert-success">Account created! Redirecting to login…</div>
                )}
                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}

                <form
                  className={`needs-validation ${validated ? 'was-validated' : ''}`}
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email" name="email" className="form-control"
                        value={form.email} onChange={handleChange} required
                      />
                      <div className="invalid-feedback">Please enter a valid email.</div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Password</label>
                      <input
                        type="password" name="password" className="form-control"
                        value={form.password} onChange={handleChange}
                        minLength={6} required
                      />
                      <div className="invalid-feedback">Password must be at least 6 characters.</div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">First name</label>
                      <input
                        name="firstName" className="form-control"
                        value={form.firstName} onChange={handleChange} required
                      />
                      <div className="invalid-feedback">Please enter your first name.</div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Last name</label>
                      <input
                        name="lastName" className="form-control"
                        value={form.lastName} onChange={handleChange} required
                      />
                      <div className="invalid-feedback">Please enter your last name.</div>
                    </div>

                    <div className="col-12">
                      <h6 className="mt-2 mb-0 fw-semibold">Shipping Address</h6>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label">Street Name</label>
                      <input
                        name="streetName" className="form-control"
                        value={form.streetName} onChange={handleChange} required
                      />
                      <div className="invalid-feedback">Street is required.</div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Street Number</label>
                      <input
                        name="streetNumber" className="form-control"
                        value={form.streetNumber} onChange={handleChange} required
                      />
                      <div className="invalid-feedback">Number is required.</div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">City</label>
                      <input
                        name="city" className="form-control"
                        value={form.city} onChange={handleChange} required
                      />
                      <div className="invalid-feedback">City is required.</div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Country</label>
                      <input
                        name="country" className="form-control"
                        value={form.country} onChange={handleChange} required
                      />
                      <div className="invalid-feedback">Country is required.</div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Postal Code</label>
                      <input
                        name="postalCode" className="form-control"
                        value={form.postalCode} onChange={handleChange} required
                      />
                      <div className="invalid-feedback">Postal code is required.</div>
                    </div>

                    <div className="col-12 d-grid d-sm-flex gap-2 mt-2">
                      <button className="btn btn-primary px-4" type="submit" disabled={loading || success}>
                        {loading ? 'Creating…' : 'Create Account'}
                      </button>
                      <Link className="btn btn-outline-secondary" to="/">Cancel</Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <p className="text-center mt-3">
              Already have an account? <Link to="/">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
