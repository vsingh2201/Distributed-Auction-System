import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function fmt(n) { return Number(n || 0).toFixed(2) }

export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const { userId, userName, userEmail } = useAuth()

  const itemId         = searchParams.get('itemId')
  const winning        = Number(searchParams.get('winning') || 0)
  const shippingAmount = Number(searchParams.get('ship') || 0)
  const shippingChoice = (searchParams.get('shipping') || 'STANDARD').toUpperCase()

  const [itemName, setItemName] = useState(`Item ${itemId}`)
  const [form, setForm]         = useState({ cardNumber: '', cardName: '', cardExp: '', cvv: '' })
  const [validated, setValidated] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (!itemId) return
    api.item(itemId).then(it => setItemName(it.name || `Item ${itemId}`)).catch(() => {})
  }, [itemId])

  if (!itemId) {
    return <div className="container"><div className="alert alert-danger mt-4">Missing itemId in URL.</div></div>
  }

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
      const res = await api.pay({
        itemId:         Number(itemId),
        userId:         Number(userId),
        shippingChoice,
        cardNumber:     form.cardNumber.trim(),
        cardName:       form.cardName.trim(),
        cardExp:        form.cardExp.trim(),
        cvv:            form.cvv.trim(),
      })
      const paymentId = res.paymentId || res.id || ''
      setTimeout(() => navigate(`/receipt?paymentId=${encodeURIComponent(paymentId)}`), 600)
    } catch (err) {
      setError(err.message || 'Payment failed. Please check your card details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mb-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h3 mb-1">Payment</h2>
          <p className="text-muted mb-4">
            Review your details and enter your credit card information to complete payment.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row g-4">
            {/* Left — order summary */}
            <div className="col-lg-6 border-end">
              <h5 className="mb-3">Winning bidder</h5>
              <dl className="row mb-2">
                <dt className="col-4">Name</dt>
                <dd className="col-8">{userName || `User #${userId}`}</dd>
                <dt className="col-4">Email</dt>
                <dd className="col-8">{userEmail || '–'}</dd>
              </dl>

              <h6 className="mt-4 mb-2">Shipping address</h6>
              <p className="mb-1 text-muted">Address on file will be used.</p>

              <hr className="my-4" />

              <h5 className="mb-3">Order summary</h5>
              <p className="mb-1 fw-semibold">{itemName}</p>
              <p className="text-muted mb-2">Item ID: {itemId}</p>

              <dl className="row mb-0">
                <dt className="col-6">Winning bid</dt>
                <dd className="col-6 text-end">${fmt(winning)}</dd>
                <dt className="col-6">Shipping ({shippingChoice === 'EXPEDITED' ? 'Expedited' : 'Standard'})</dt>
                <dd className="col-6 text-end">${fmt(shippingAmount)}</dd>
                <dt className="col-6 fw-semibold">Total cost</dt>
                <dd className="col-6 text-end fw-semibold">${fmt(winning + shippingAmount)}</dd>
              </dl>
            </div>

            {/* Right — card form */}
            <div className="col-lg-6">
              <h5 className="mb-3">Credit card</h5>
              <form
                className={`needs-validation ${validated ? 'was-validated' : ''}`}
                noValidate
                onSubmit={handleSubmit}
              >
                <div className="mb-3">
                  <label className="form-label">Card number</label>
                  <input
                    type="text" name="cardNumber" className="form-control"
                    value={form.cardNumber} onChange={handleChange}
                    minLength={8} maxLength={19} inputMode="numeric" required
                  />
                  <div className="invalid-feedback">Please enter a card number.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Name on card</label>
                  <input
                    type="text" name="cardName" className="form-control"
                    value={form.cardName} onChange={handleChange} required
                  />
                  <div className="invalid-feedback">Please enter the cardholder name.</div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      type="text" name="cardExp" className="form-control"
                      placeholder="12/29" value={form.cardExp} onChange={handleChange} required
                    />
                    <div className="invalid-feedback">Please enter expiry date.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">CVV</label>
                    <input
                      type="password" name="cvv" className="form-control"
                      value={form.cvv} onChange={handleChange}
                      minLength={3} maxLength={4} inputMode="numeric" required
                    />
                    <div className="invalid-feedback">Please enter CVV.</div>
                  </div>
                </div>

                <div className="d-grid mt-4">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? 'Processing…' : 'Submit Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
