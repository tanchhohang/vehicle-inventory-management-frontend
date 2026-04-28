import { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:5047/api/purchase-invoices'

const styles = {
  page: { maxWidth: 900, margin: '0 auto', padding: 20, fontFamily: 'Arial, sans-serif' },
  section: { marginBottom: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8 },
  row: { display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
  input: { padding: 8, border: '1px solid #ccc', borderRadius: 6, flex: 1, minWidth: 160 },
  button: { padding: '8px 12px', border: '1px solid #999', borderRadius: 6, cursor: 'pointer' },
  card: { border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10, background: '#fafafa' },
  muted: { color: '#666' },
  error: { color: '#b00020' },
}

function PurchaseInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    vendorName: '',
    partName: '',
    quantity: 0,
    unitPrice: 0,
  })

  const normalizeInvoice = (invoice) => {
    const vendorName = invoice.vendorName ?? invoice.vendor ?? invoice.vendor_name ?? ''
    const partName = invoice.partName ?? invoice.part ?? invoice.part_name ?? ''
    const quantityValue = invoice.quantity ?? invoice.qty ?? invoice.partQuantity ?? invoice.part_quantity ?? 0
    const unitPriceValue = invoice.unitPrice ?? invoice.price ?? invoice.unit_price ?? 0
    const quantity = Number(quantityValue) || 0
    const unitPrice = Number(unitPriceValue) || 0

    return {
      id: invoice.id ?? invoice.invoiceId ?? `${vendorName}-${partName}-${Date.now()}`,
      vendorName,
      partName,
      quantity,
      unitPrice,
    }
  }

  const fetchInvoices = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) {
        throw new Error('Failed to fetch invoices')
      }
      const data = await response.json()
      setInvoices(Array.isArray(data) ? data.map(normalizeInvoice) : [])
    } catch (err) {
      setError(err.message || 'Something went wrong while loading invoices.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => {
      if (name === 'quantity') {
        return { ...prev, quantity: Number.parseInt(value || '0', 10) || 0 }
      }
      if (name === 'unitPrice') {
        return { ...prev, unitPrice: Number.parseFloat(value || '0') || 0 }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const payload = {
      vendorName: form.vendorName,
      partName: form.partName,
      quantity: form.quantity,
      unitPrice: form.unitPrice,
    }

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error('Failed to create purchase invoice')
      }
      setForm({ vendorName: '', partName: '', quantity: 0, unitPrice: 0 })
      await fetchInvoices()
    } catch (err) {
      setError(err.message || 'Could not create invoice.')
    }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete invoice')
      }
      await fetchInvoices()
    } catch (err) {
      setError(err.message || 'Could not delete invoice.')
    }
  }

  return (
    <div style={styles.page}>
      <h1>Purchase Invoices</h1>

      <section style={styles.section}>
        <h2>Create New Purchase Invoice</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.row}>
            <input
              style={styles.input}
              type="text"
              name="vendorName"
              placeholder="Vendor name"
              value={form.vendorName}
              onChange={handleChange}
              required
            />
            <input
              style={styles.input}
              type="text"
              name="partName"
              placeholder="Part name"
              value={form.partName}
              onChange={handleChange}
              required
            />
            <input
              style={styles.input}
              type="number"
              min="1"
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              required
            />
            <input
              style={styles.input}
              type="text"
              name="unitPrice"
              placeholder="Unit price"
              value={form.unitPrice}
              onChange={handleChange}
              required
            />
            <button style={styles.button} type="submit">
              Create Invoice
            </button>
          </div>
        </form>
      </section>

      <section style={styles.section}>
        <h2>Past Invoices</h2>
        {loading && <p style={styles.muted}>Loading invoices...</p>}
        {error && <p style={styles.error}>{error}</p>}
        {!loading && invoices.length === 0 && <p style={styles.muted}>No invoices found.</p>}
        {invoices.map((invoice) => (
          <div key={invoice.id} style={styles.card}>
            <p><strong>Vendor name:</strong> {invoice.vendorName}</p>
            <p><strong>Part name:</strong> {invoice.partName}</p>
            <p><strong>Quantity:</strong> {invoice.quantity}</p>
            <p><strong>Unit Price:</strong> {invoice.unitPrice.toFixed(2)}</p>
            <p><strong>Total:</strong> {(invoice.quantity * invoice.unitPrice).toFixed(2)}</p>
            <button style={styles.button} type="button" onClick={() => handleDelete(invoice.id)}>
              Delete
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}

export default PurchaseInvoices
