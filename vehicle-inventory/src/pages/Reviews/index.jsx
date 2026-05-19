import { useEffect, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import '../UserManagement/index.css'

const API_BASE = 'http://localhost:5047/api/reviews'

function normalizeReview(review) {
  return {
    id: review.id ?? review.Id ?? review.reviewId ?? review.ReviewId,
    customerName: review.customerName ?? review.CustomerName ?? '',
    rating: Number(review.rating ?? review.Rating ?? 0) || 0,
    comment: review.comment ?? review.Comment ?? '',
  }
}

function formatStarRating(rating) {
  const count = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)))
  return '⭐'.repeat(count) || '—'
}

function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ customerName: '', rating: 5, comment: '' })

  const fetchReviews = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      const data = await response.json()
      setReviews(Array.isArray(data) ? data.map(normalizeReview) : [])
    } catch (err) {
      setError(err.message || 'Something went wrong while loading reviews.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error('Failed to submit review')
      setForm({ customerName: '', rating: 5, comment: '' })
      fetchReviews()
    } catch (err) {
      setError(err.message || 'Could not submit review.')
    }
  }

  const handleDelete = async (id) => {
    if (id == null || id === '') return
    if (!window.confirm('Delete this review?')) return
    setError('')
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete review')
      await fetchReviews()
    } catch (err) {
      console.error('Failed to delete review:', err)
      setError(err.message || 'Could not delete review.')
    }
  }

  const filtered = reviews.filter((item) => {
    const q = search.toLowerCase()
    return (
      item.customerName?.toLowerCase().includes(q) ||
      String(item.rating).includes(q) ||
      item.comment?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="um-page">
      <div className="um-page-header">
        <div className="um-page-title-group">
          <div>
            <h1 className="um-page-title">Reviews</h1>
            <p className="um-page-subtitle">Submit feedback and browse customer reviews</p>
          </div>
        </div>
        <div className="um-header-actions">
          <div className="um-search-wrap">
            <Search size={14} className="um-search-icon" />
            <input className="um-search" type="text" placeholder="Search reviews…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {error && <div className="um-error-banner">{error}</div>}

      <div className="um-card" style={{ marginBottom: 20, padding: 20 }}>
        <h2 className="um-page-title" style={{ fontSize: 16, marginBottom: 16 }}>Submit Review</h2>
        <form onSubmit={handleSubmit}>
          <div className="um-header-actions" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
            <input className="um-search" style={{ width: 180 }} type="text" name="customerName" placeholder="Customer name" value={form.customerName} onChange={handleChange} required />
            <select className="um-search" style={{ width: 140 }} name="rating" value={form.rating} onChange={handleChange}>
              <option value={1}>1 Star</option>
              <option value={2}>2 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={5}>5 Stars</option>
            </select>
            <button className="um-btn um-btn--primary" type="submit">Submit Review</button>
          </div>
          <textarea className="um-search" style={{ width: '100%', height: 'auto', minHeight: 80, padding: '10px 13px' }} name="comment" placeholder="Your comment" value={form.comment} onChange={handleChange} required />
        </form>
      </div>

      <div className="um-card">
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Rating</th>
                <th>Comment</th>
                <th className="um-th-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="um-state-cell">
                    <span className="um-table-spinner" />
                    <span className="um-state-text">Loading reviews…</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="um-state-cell">
                    <span className="um-state-text">{search ? 'No reviews match your search.' : 'No reviews yet.'}</span>
                  </td>
                </tr>
              ) : (
                filtered.map((review) => (
                  <tr key={review.id} className="um-row">
                    <td className="um-username">{review.customerName || '—'}</td>
                    <td aria-label={`${review.rating} out of 5 stars`}>{formatStarRating(review.rating)}</td>
                    <td style={{ whiteSpace: 'normal' }}>{review.comment || '—'}</td>
                    <td className="um-td-center">
                      <button
                        type="button"
                        className="um-action-btn um-action-btn--delete"
                        onClick={() => handleDelete(review.id)}
                        title="Delete review"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reviews
