import { useEffect, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import '../UserManagement/index.css'

const API_BASE = 'http://localhost:5047/api/appointments'

const normalizeAppointment = (appointment) => ({
  id:
    appointment.id ??
    appointment.Id ??
    appointment.appointmentId ??
    appointment.AppointmentId,
  customerName:
    appointment.customerName ?? appointment.CustomerName ?? '',
  date: appointment.date ?? appointment.Date ?? '',
  time: appointment.time ?? appointment.Time ?? '',
  reason: appointment.reason ?? appointment.Reason ?? '',
  status: appointment.status ?? appointment.Status ?? '',
})

const STATUS_BADGE_STYLES = {
  pending: { background: '#FFF4E5', color: '#B45309' },
  confirmed: { background: '#E6F4EA', color: '#1E7E34' },
  cancelled: { background: '#FDECEA', color: '#C62828' },
  canceled: { background: '#FDECEA', color: '#C62828' },
}

function StatusBadge({ status }) {
  const label = status ? String(status) : '—'
  const key = label.toLowerCase()
  const style = STATUS_BADGE_STYLES[key] ?? { background: '#EFEFEF', color: '#444' }
  return (
    <span className="um-badge" style={style}>
      {label}
    </span>
  )
}

function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    customerName: '',
    date: '',
    time: '',
    reason: '',
  })

  const fetchAppointments = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) throw new Error('Failed to fetch appointments')
      const data = await response.json()
      setAppointments(Array.isArray(data) ? data.map(normalizeAppointment) : [])
    } catch (err) {
      console.error('Failed to fetch appointments:', err)
      setError(err.message || 'Something went wrong while loading appointments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
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
      if (!response.ok) throw new Error('Failed to book appointment')
      setForm({ customerName: '', date: '', time: '', reason: '' })
      fetchAppointments()
    } catch (err) {
      setError(err.message || 'Could not create appointment.')
    }
  }

  const handleCancel = async (id) => {
    if (id == null || id === '') return
    if (!window.confirm('Cancel this appointment?')) return
    setError('')
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to cancel appointment')
      await fetchAppointments()
    } catch (err) {
      console.error('Failed to cancel appointment:', err)
      setError(err.message || 'Could not cancel appointment.')
    }
  }

  const filtered = appointments.filter((item) => {
    const q = search.toLowerCase()
    return (
      item.customerName?.toLowerCase().includes(q) ||
      item.date?.toLowerCase().includes(q) ||
      item.time?.toLowerCase().includes(q) ||
      item.reason?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="um-page">
      <div className="um-page-header">
        <div className="um-page-title-group">
          <div>
            <h1 className="um-page-title">Appointments</h1>
            <p className="um-page-subtitle">Book and manage service appointments</p>
          </div>
        </div>
        <div className="um-header-actions">
          <div className="um-search-wrap">
            <Search size={14} className="um-search-icon" />
            <input
              className="um-search"
              type="text"
              placeholder="Search appointments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="um-error-banner">{error}</div>}

      <div className="um-card" style={{ marginBottom: 20, padding: 20 }}>
        <h2 className="um-page-title" style={{ fontSize: 16, marginBottom: 16 }}>
          Book New Appointment
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="um-header-actions" style={{ flexWrap: 'wrap' }}>
            <input className="um-search" style={{ width: 180 }} type="text" name="customerName" placeholder="Customer name" value={form.customerName} onChange={handleChange} required />
            <input className="um-search" style={{ width: 160 }} type="date" name="date" value={form.date} onChange={handleChange} required />
            <input className="um-search" style={{ width: 140 }} type="time" name="time" value={form.time} onChange={handleChange} required />
            <input className="um-search" style={{ width: 200 }} type="text" name="reason" placeholder="Reason for visit" value={form.reason} onChange={handleChange} required />
            <button className="um-btn um-btn--primary" type="submit">Book Appointment</button>
          </div>
        </form>
      </div>

      <div className="um-card">
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th className="um-th-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="um-state-cell">
                    <span className="um-table-spinner" />
                    <span className="um-state-text">Loading appointments…</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="um-state-cell">
                    <span className="um-state-text">
                      {search ? 'No appointments match your search.' : 'No appointments found.'}
                    </span>
                  </td>
                </tr>
              ) : (
                filtered.map((appointment) => (
                  <tr key={appointment.id} className="um-row">
                    <td className="um-username">{appointment.customerName || '—'}</td>
                    <td>{appointment.date || '—'}</td>
                    <td>{appointment.time || '—'}</td>
                    <td>{appointment.reason || '—'}</td>
                    <td>
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="um-td-center">
                      <button type="button" className="um-action-btn um-action-btn--delete" onClick={() => handleCancel(appointment.id)} title="Cancel appointment">
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

export default Appointments
