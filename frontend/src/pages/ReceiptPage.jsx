import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function fmt(n) { return Number(n || 0).toFixed(2) }

export default function ReceiptPage() {
  const [searchParams] = useSearchParams()
  const { userName, userEmail } = useAuth()
  const paymentId = searchParams.get('paymentId')

  const [receipt, setReceipt]           = useState(null)
  const [itemName, setItemName]         = useState(null)
  const [shippingDays, setShippingDays] = useState(null)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!paymentId) { setError('Missing paymentId in URL.'); setLoading(false); return }
    let cancelled = false

    async function load() {
      try {
        const r = await api.receipt(paymentId)
        if (cancelled) return
        setReceipt(r)

        // receipt has no itemId — shipping days already in receipt.shipInDays
        if (r.shipInDays != null) setShippingDays(r.shipInDays)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load receipt.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [paymentId])

  if (loading) return <div className="container"><div className="text-center py-5"><div className="spinner-border" /></div></div>

  const totalPaid   = Number(receipt?.total ?? 0)
  const shippingAmt = Number(receipt?.shippingAmount ?? 0)
  const bidAmt      = totalPaid - shippingAmt >= 0 ? totalPaid - shippingAmt : totalPaid
  const choice      = (receipt?.shippingChoice || 'STANDARD').toUpperCase()

  return (
    <main className="container my-4">
      <div className="row mb-3">
        <div className="col">
          <h1 className="h3 fw-semibold">Receipt &amp; Shipping Details</h1>
          <p className="text-muted mb-0">Review your payment confirmation and shipping information.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {receipt && (
        <div className="row g-4">
          {/* Receipt column */}
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h2 className="h5 mb-0">Receipt</h2>
              </div>
              <div className="card-body">
                <h6 className="text-muted text-uppercase mb-2">Winning bidder</h6>
                <p className="mb-1">
                  <span className="fw-semibold">{userName || '–'}</span><br />
                  <span className="text-muted small">{userEmail || '–'}</span>
                </p>

                <hr />

                <h6 className="text-muted text-uppercase mb-2">Item</h6>
                <p className="mb-1">
                  <span className="fw-semibold">{itemName || 'Item'}</span>
                </p>

                <hr />

                <h6 className="text-muted text-uppercase mb-2">Amounts</h6>
                <dl className="row mb-0">
                  <dt className="col-6">Winning bid</dt>
                  <dd className="col-6 text-end">${fmt(bidAmt)}</dd>
                  <dt className="col-6">Shipping ({choice === 'EXPEDITED' ? 'Expedited' : 'Standard'})</dt>
                  <dd className="col-6 text-end">${fmt(shippingAmt)}</dd>
                  <dt className="col-6 fw-semibold">Total paid</dt>
                  <dd className="col-6 text-end fw-semibold">${fmt(totalPaid)}</dd>
                </dl>

                <p className="text-muted small mt-3 mb-0">
                  Receipt ID: {receipt.receiptId ?? receipt.paymentId ?? paymentId ?? '–'}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping details column */}
          <div className="col-lg-5">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white">
                <h2 className="h5 mb-0">Shipping details</h2>
              </div>
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <p className="mb-2">
                    {shippingDays != null
                      ? `The item will be shipped in ${shippingDays} day${shippingDays === 1 ? '' : 's'}.`
                      : 'Shipping time information is not available for this item.'}
                  </p>
                  {receipt.addressLine && (
                    <p className="text-muted small mb-2">{receipt.addressLine}</p>
                  )}
                  <p className="text-muted small mb-0">
                    Shipping time does not account for weekends or holidays.
                  </p>
                </div>
                <div className="mt-4">
                  <Link to="/catalogue" className="btn btn-outline-primary w-100">
                    Back to catalogue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
