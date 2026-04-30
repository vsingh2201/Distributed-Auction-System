import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function UploadItemPage() {
  const { userId, userEmail } = useAuth()

  const [form, setForm] = useState({
    itemName: '', description: '', duration: '10', startingBid: '0',
  })
  const [validated, setValidated] = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setValidated(true)
    if (!e.target.checkValidity()) return
    setError('')
    setSuccess('')
    setLoading(true)

    const duration    = Number(form.duration) || 0
    const startingBid = Number(form.startingBid) || 0
    const endsAt      = new Date(Date.now() + duration * 60 * 1000)
      .toISOString().substring(0, 19)   // "YYYY-MM-DDTHH:mm:ss"

    try {
      const res = await api.createItem({
        name:        form.itemName.trim(),
        keywords:    form.description.trim(),
        startPrice:  startingBid,
        endsAt,
        status:      'ACTIVE',
        standardCost:  0,
        expeditedCost: 0,
        shipInDays:    0,
      })

      const newId = res.itemId ?? res.id ?? null
      if (!newId) throw new Error('Catalogue item created but no itemId returned.')

      await api.createAuction(Number(newId), startingBid, endsAt, Number(userId))

      setSuccess(`Auction created! Item ID: ${newId}`)
      setForm({ itemName: '', description: '', duration: '10', startingBid: '0' })
      setValidated(false)
    } catch (err) {
      setError(err.message || 'Failed to create auction item.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4">Upload Auction Item</h1>
          <p className="text-muted mb-4">
            Upload information about the item you want to auction. Include the description,
            auction type (Forward), duration, and starting bid price.
          </p>

          {error   && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Seller info */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Seller</h5>
              <div className="row mb-2">
                <div className="col-sm-4 text-muted">Logged in as</div>
                <div className="col-sm-8">{userEmail || `User #${userId}`}</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Auction item details</h5>
              <form
                className={`needs-validation ${validated ? 'was-validated' : ''}`}
                noValidate
                onSubmit={handleSubmit}
              >
                <div className="mb-3">
                  <label className="form-label">Item name</label>
                  <input
                    name="itemName" className="form-control"
                    value={form.itemName} onChange={handleChange} required
                  />
                  <div className="invalid-feedback">Please enter the item name.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description" className="form-control" rows={3}
                    value={form.description} onChange={handleChange} required
                  />
                  <div className="invalid-feedback">Please provide a brief description.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Auction type</label>
                  <select className="form-select" disabled>
                    <option>Forward</option>
                  </select>
                  <div className="form-text">Only Forward auctions are supported.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Duration <span className="text-muted">(minutes)</span></label>
                  <input
                    type="number" name="duration" className="form-control"
                    value={form.duration} onChange={handleChange}
                    min="1" step="1" required
                  />
                  <div className="invalid-feedback">Please enter a positive duration in minutes.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Starting bid price ($)</label>
                  <input
                    type="number" name="startingBid" className="form-control"
                    value={form.startingBid} onChange={handleChange}
                    min="0" step="1" required
                  />
                  <div className="invalid-feedback">Please enter a valid starting bid.</div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating…' : 'Create auction item'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
