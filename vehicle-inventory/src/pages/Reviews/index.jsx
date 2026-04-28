import { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:5047/api/reviews'

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: 'Arial, sans-serif' },
  section: { marginBottom: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8 },
  row: { display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
  input: { padding: 8, border: '1px solid #ccc', borderRadius: 6, flex: 1, minWidth: 180 },
  textarea: { padding: 8, border: '1px solid #ccc', borderRadius: 6, width: '100%', minHeight: 80 },
  button: { padding: '8px 12px', border: '1px solid #999', borderRadius: 6, cursor: 'pointer' },
  card: { border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10, background: '#fafafa' },
  muted: { color: '#666' },
  error: { color: '#b00020' },
}

function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    customerName: '',
    rating: 5,
    comment: '',
  })

  const fetchReviews = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      const data = await response.json()
      setReviews(Array.isArray(data) ? data : [])
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
      if (!response.ok) {
        throw new Error('Failed to submit review')
      }
      setForm({ customerName: '', rating: 5, comment: '' })
      fetchReviews()
    } catch (err) {
      setError(err.message || 'Could not submit review.')
    }
  }

  return (
    <div style={styles.page}>
      <h1>Reviews</h1>

      <section style={styles.section}>
        <h2>Submit Review</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.row}>
            <input
              style={styles.input}
              type="text"
              name="customerName"
              placeholder="Customer name"
              value={form.customerName}
              onChange={handleChange}
              required
            />
            <select style={styles.input} name="rating" value={form.rating} onChange={handleChange}>
              <option value={1}>1 Star</option>
              <option value={2}>2 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={5}>5 Stars</option>
            </select>
            <button style={styles.button} type="submit">
              Submit
            </button>
          </div>
          <textarea
            style={styles.textarea}
            name="comment"
            placeholder="Your comment"
            value={form.comment}
            onChange={handleChange}
            required
          />
        </form>
      </section>

      <section style={styles.section}>
        <h2>All Reviews</h2>
        {loading && <p style={styles.muted}>Loading reviews...</p>}
        {error && <p style={styles.error}>{error}</p>}
        {!loading && reviews.length === 0 && <p style={styles.muted}>No reviews yet.</p>}
        {reviews.map((review) => (
          <div key={review.id} style={styles.card}>
            <p><strong>Name:</strong> {review.customerName}</p>
            <p><strong>Rating:</strong> {review.rating} / 5</p>
            <p><strong>Comment:</strong> {review.comment}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

export default Reviews
