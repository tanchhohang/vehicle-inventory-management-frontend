import { useEffect, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import '../UserManagement/index.css'

const API_BASE = 'http://localhost:5047/api/part-requests'

const INITIAL_FORM = { customerName: '', partName: '', description: '' }

function normalizeRequest(item) {
  return {
    id: item.id ?? item.Id ?? item.partRequestId,
    customerName: item.customerName ?? item.CustomerName ?? '',
    partName: item.partName ?? item.PartName ?? '',
    description: item.description ?? item.Description ?? '',
  }
}

function PartRequests() {
  const [requests, setRequests] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) throw new Error('Failed to load part requests')
      const data = await response.json()
      setRequests(Array.isArray(data) ? data.map(normalizeRequest) : [])
    } catch (err) {
      console.error('Failed to fetch part requests:', err)
      setError(err.message || 'Could not load part requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error('Failed to submit part request')
      setForm(INITIAL_FORM)
      setSuccess('Your part request was submitted successfully.')
      await fetchRequests()
    } catch (err) {
      console.error('Failed to submit part request:', err)
      setError(err.message || 'Could not submit part request.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (id == null || id === '') return
    if (!window.confirm('Delete this part request?')) return
    setError('')
    setSuccess('')
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete part request')
      await fetchRequests()
    } catch (err) {
      console.error('Failed to delete part request:', err)
      setError(err.message || 'Could not delete part request.')
    }
  }

  const filtered = requests.filter((item) => {
    const q = search.toLowerCase()
    return (
      item.customerName?.toLowerCase().includes(q) ||
      item.partName?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="um-page">
      <div className="um-page-header">
        <div className="um-page-title-group">
          <div>
            <h1 className="um-page-title">Part Requests</h1>
            <p className="um-page-subtitle">Request parts that are currently unavailable</p>
          </div>
        </div>
        <div className="um-header-actions">
          <div className="um-search-wrap">
            <Search size={14} className="um-search-icon" />
            <input className="um-search" type="text" placeholder="Search requests…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {error && <div className="um-error-banner">{error}</div>}
      {success && (
        <div
          className="um-error-banner"
          style={{ background: '#EAF0F8', borderColor: '#B8C9DC', color: 'var(--color-primary, #002B51)' }}
        >
          {success}
        </div>
      )}

      <div className="um-card" style={{ marginBottom: 20, padding: 20 }}>
        <h2 className="um-page-title" style={{ fontSize: 16, marginBottom: 16 }}>New Part Request</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <input className="um-search" type="text" name="customerName" placeholder="Customer name" value={form.customerName} onChange={handleChange} required />
            <input className="um-search" type="text" name="partName" placeholder="Part name or number" value={form.partName} onChange={handleChange} required />
            <textarea className="um-search" name="description" placeholder="Description…" value={form.description} onChange={handleChange} required rows={4} style={{ height: 'auto', minHeight: 80, padding: '10px 13px' }} />
          </div>
          <button className="um-btn um-btn--primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      </div>

      <div className="um-card">
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Part Name</th>
                <th>Description</th>
                <th className="um-th-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="um-state-cell">
                    <span className="um-table-spinner" />
                    <span className="um-state-text">Loading requests…</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="um-state-cell">
                    <span className="um-state-text">{search ? 'No requests match your search.' : 'No part requests submitted yet.'}</span>
                  </td>
                </tr>
              ) : (
                filtered.map((request, index) => (
                  <tr key={request.id ?? index} className="um-row">
                    <td className="um-username">{request.customerName || '—'}</td>
                    <td>{request.partName || '—'}</td>
                    <td style={{ whiteSpace: 'normal' }}>{request.description || '—'}</td>
                    <td className="um-td-center">
                      <button
                        type="button"
                        className="um-action-btn um-action-btn--delete"
                        onClick={() => handleDelete(request.id)}
                        title="Delete part request"
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

export default PartRequests
