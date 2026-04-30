import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function CataloguePage() {
  const [query, setQuery]   = useState('')
  const [items, setItems]   = useState(null)   // null = not yet searched
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function search() {
    setLoading(true)
    setError('')
    try {
      const results = await api.search(query.trim())
      setItems(results)
    } catch (e) {
      setError(e.message || 'Failed to load catalogue')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); search() }
  }

  return (
    <div className="container">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 align-items-center mb-3">
            <div className="col-sm-8">
              <input
                className="form-control"
                placeholder="Search items..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="col-sm-4 text-sm-end">
              <button className="btn btn-primary" onClick={search} disabled={loading}>
                {loading ? 'Searching…' : 'Search'}
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th className="text-end">Price</th>
                  <th>Ends At</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items === null && (
                  <tr><td colSpan={4} className="text-muted">Type a keyword and click Search.</td></tr>
                )}
                {items !== null && items.length === 0 && !loading && (
                  <tr><td colSpan={4} className="text-muted">No items found.</td></tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={4}>
                      <div className="text-center py-3">
                        <div className="spinner-border" role="status" />
                        <span className="ms-2">Loading...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && items && items.map(it => (
                  <tr key={it.itemId}>
                    <td>{it.name || `Item ${it.itemId}`}</td>
                    <td className="text-end">${it.currentPrice ?? it.startPrice ?? '-'}</td>
                    <td>{it.endsAt || '-'}</td>
                    <td className="text-end">
                      <Link className="btn btn-sm btn-outline-primary" to={`/bid?itemId=${it.itemId}`}>
                        Bid
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
