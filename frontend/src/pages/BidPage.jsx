import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function BidPage() {
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get('itemId')
  const { userId } = useAuth()

  const [auction, setAuction]   = useState(null)
  const [countdown, setCountdown] = useState('--')
  const [bidAmount, setBidAmount] = useState('')
  const [validated, setValidated] = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)

  const loadState = useCallback(async () => {
    if (!itemId) return
    try {
      const state = await api.state(itemId)
      setAuction(state)
      setError('')
    } catch (e) {
      setError(e.message || 'Failed to fetch auction state.')
    }
  }, [itemId])

  // Poll every 5 seconds
  useEffect(() => {
    if (!itemId) return
    loadState()
    const id = setInterval(loadState, 5000)
    return () => clearInterval(id)
  }, [itemId, loadState])

  // Countdown — restarts only when endTime or status changes
  const endTime = auction?.endTime
  const status  = auction?.status
  useEffect(() => {
    if (!endTime || status !== 'OPEN') {
      setCountdown(auction ? 'Auction ended' : '--')
      return
    }
    const endMs = new Date(endTime).getTime()
    const tick = () => {
      const diff = endMs - Date.now()
      if (diff <= 0) { setCountdown('Auction ended'); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`Ends in ${m}m ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTime, status]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleBid(e) {
    e.preventDefault()
    setValidated(true)
    if (!e.target.checkValidity()) return
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.bid(itemId, userId, bidAmount)
      setSuccess('Bid placed successfully!')
      setBidAmount('')
      setValidated(false)
      await loadState()
      setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      setError(err.message || 'Bid failed. Make sure it is higher than the current price and the auction is still open.')
    } finally {
      setLoading(false)
    }
  }

  if (!itemId) {
    return (
      <div className="container">
        <div className="alert alert-danger">Missing itemId in URL.</div>
      </div>
    )
  }

  const price = auction ? (auction.currentPrice ?? auction.startPrice ?? '-') : '-'
  const isWinner = auction && Number(auction.highestBidderId) === Number(userId)
  const isEnded  = auction?.status === 'ENDED'

  return (
    <main className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">

          {/* Auction summary */}
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h1 className="h4 mb-3 fw-bold">Bid on Item</h1>

              {error   && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="row g-3">
                <div className="col-md-3 col-6">
                  <div className="text-muted small text-uppercase">Item ID</div>
                  <div className="fw-semibold">{itemId}</div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="text-muted small text-uppercase">Current Price</div>
                  <div className="fw-semibold">{price !== '-' ? `$${price}` : '-'}</div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="text-muted small text-uppercase">Highest Bidder</div>
                  <div className="fw-semibold">{auction?.highestBidderId ?? '-'}</div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="text-muted small text-uppercase">Time Remaining</div>
                  <div className={`fw-semibold ${isEnded ? 'text-danger' : 'text-primary'}`}>
                    {countdown}
                  </div>
                </div>
              </div>

              {isEnded && isWinner && (
                <div className="mt-3">
                  <Link className="btn btn-success" to={`/pay?itemId=${itemId}`}>
                    You won! Pay Now →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bid form — hidden once auction is ended */}
          {!isEnded && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-3">Place a Bid</h2>
                <form
                  className={`row g-3 needs-validation ${validated ? 'was-validated' : ''}`}
                  noValidate
                  onSubmit={handleBid}
                >
                  <div className="col-md-6">
                    <label className="form-label">Your bid amount</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number" min="1" className="form-control"
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                        required
                      />
                      <div className="invalid-feedback">Please enter a bid amount greater than 0.</div>
                    </div>
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                      {loading ? 'Placing…' : 'Place Bid'}
                    </button>
                  </div>
                  <div className="col-12">
                    <small className="text-muted">
                      Bids must be strictly higher than the current price. Page auto-refreshes every few seconds.
                    </small>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
