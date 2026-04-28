import { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:5047/api/appointments'

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: 'Arial, sans-serif' },
  section: { marginBottom: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8 },
  row: { display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
  input: { padding: 8, border: '1px solid #ccc', borderRadius: 6, flex: 1, minWidth: 180 },
  button: { padding: '8px 12px', border: '1px solid #999', borderRadius: 6, cursor: 'pointer' },
  dangerButton: { padding: '8px 12px', border: '1px solid #b33', color: '#b33', borderRadius: 6, cursor: 'pointer', background: '#fff' },
  card: { border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10, background: '#fafafa' },
  muted: { color: '#666' },
  error: { color: '#b00020' },
}

function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      const data = await response.json()
      setAppointments(Array.isArray(data) ? data : [])
    } catch (err) {
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
      if (!response.ok) {
        throw new Error('Failed to book appointment')
      }
      setForm({ customerName: '', date: '', time: '', reason: '' })
      fetchAppointments()
    } catch (err) {
      setError(err.message || 'Could not create appointment.')
    }
  }

  const handleCancel = async (id) => {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to cancel appointment')
      }
      setAppointments((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setError(err.message || 'Could not cancel appointment.')
    }
  }

  return (
    <div style={styles.page}>
      <h1>Appointments</h1>

      <section style={styles.section}>
        <h2>Book New Appointment</h2>
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
            <input style={styles.input} type="date" name="date" value={form.date} onChange={handleChange} required />
            <input style={styles.input} type="time" name="time" value={form.time} onChange={handleChange} required />
          </div>
          <div style={styles.row}>
            <input
              style={styles.input}
              type="text"
              name="reason"
              placeholder="Reason"
              value={form.reason}
              onChange={handleChange}
              required
            />
            <button style={styles.button} type="submit">
              Book Appointment
            </button>
          </div>
        </form>
      </section>

      <section style={styles.section}>
        <h2>My Appointments</h2>
        {loading && <p style={styles.muted}>Loading appointments...</p>}
        {error && <p style={styles.error}>{error}</p>}
        {!loading && appointments.length === 0 && <p style={styles.muted}>No appointments found.</p>}
        {appointments.map((appointment) => (
          <div key={appointment.id} style={styles.card}>
            <p><strong>Name:</strong> {appointment.customerName}</p>
            <p><strong>Date:</strong> {appointment.date}</p>
            <p><strong>Time:</strong> {appointment.time}</p>
            <p><strong>Reason:</strong> {appointment.reason}</p>
            <button type="button" style={styles.dangerButton} onClick={() => handleCancel(appointment.id)}>
              Cancel
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}

export default Appointments
