import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function fmt(n) { return Number(n || 0).toFixed(2) }

export default function PayPage() {
  const [searchParams]    = useSearchParams()
  const navigate          = useNavigate()
  const { userId }        = useAuth()
  const itemId            = searchParams.get('itemId')

  const [auction, setAuction]           = useState(null)
  const [shipping, setShipping]         = useState(null)
  const [expedited, setExpedited]       = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!itemId) { setError('Missing itemId in URL.'); setLoading(false); return }
    let cancelled = false

    async function load() {
      try {
        const [state, ship] = await Promise.allSettled([
          api.state(itemId),
          api.getShipping(itemId),
        ])

        if (cancelled) return

        if (state.status === 'fulfilled') {
          setAuction(state.value)
        } else {
          setError(state.reason?.message || 'Failed to load auction state.')
        }

        if (ship.status === 'fulfilled') {
          setShipping(ship.value)
        }
        // shipping failure is non-fatal
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [itemId])

  if (loading) return <div className="container"><div className="text-center py-5"><div className="spinner-border" /></div></div>

  const winningPrice    = Number(auction?.currentPrice ?? auction?.startPrice ?? 0)
  const standardCost    = Number(shipping?.standardCost ?? 0)
  const expeditedExtra  = Number(shipping?.expeditedCost ?? 0)
  const shippingTotal   = standardCost + (expedited ? expeditedExtra : 0)
  const grandTotal      = winningPrice + shippingTotal
  const winnerId        = auction?.highestBidderId
  const isWinner        = winnerId && Number(winnerId) === Number(userId)

  function handlePay() {
    const shippingChoice = expedited ? 'EXPEDITED' : 'STANDARD'
    navigate(`/payment?itemId=${itemId}&winning=${winningPrice}&ship=${shippingTotal}&shipping=${shippingChoice}`)
  }

  return (
    <div className="container">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="card-title mb-3">Bidding Ended – Pay Now</h3>

          {error && <div className="alert alert-danger">{error}</div>}
          {!isWinner && !error && auction && (
            <div className="alert alert-warning">
              You are not the winning bidder for this auction.
            </div>
          )}

          <div className="row mb-4">
            <div className="col-md-7">
              <h5 className="fw-semibold mb-1">{shipping?.name || `Item ${itemId}`}</h5>
              <p className="mb-1 text-muted">Item ID: {itemId}</p>

              <p className="mb-1">
                Standard shipping: <span className="fw-semibold">${fmt(standardCost)}</span>
              </p>

              <div className="form-check mt-2">
                <input
                  className="form-check-input" type="checkbox" id="expeditedCheckbox"
                  checked={expedited} onChange={e => setExpedited(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="expeditedCheckbox">
                  Add expedited shipping{' '}
                  <span className="text-muted">(+ ${fmt(expeditedExtra)})</span>
                </label>
              </div>
            </div>

            <div className="col-md-5">
              <div className="border rounded p-3 bg-light">
                <div className="d-flex justify-content-between mb-1">
                  <span>Winning bid:</span>
                  <span className="fw-semibold">${fmt(winningPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Shipping total:</span>
                  <span>${fmt(shippingTotal)}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between">
                  <span className="fw-semibold">Total to pay:</span>
                  <span className="fw-bold fs-5">${fmt(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-0">
              Highest bidder (winner) user ID: <span className="fw-semibold">{winnerId ?? '–'}</span>
            </p>
            <p className="small text-muted mb-0">
              Only the winning user can successfully complete payment.
            </p>
          </div>

          <div className="text-end">
            <button className="btn btn-primary btn-lg" onClick={handlePay} disabled={!isWinner}>
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
