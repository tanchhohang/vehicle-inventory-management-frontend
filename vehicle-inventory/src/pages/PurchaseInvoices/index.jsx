import { useEffect, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import '../UserManagement/index.css'

const API_BASE = 'http://localhost:5047/api/purchase-invoices'

function PurchaseInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ vendorName: '', partName: '', quantity: 0, unitPrice: 0 })

  const normalizeInvoice = (invoice) => {
    const vendorName = invoice.vendorName ?? invoice.vendor ?? invoice.vendor_name ?? ''
    const partName = invoice.partName ?? invoice.part ?? invoice.part_name ?? ''
    const quantity = Number(invoice.quantity ?? invoice.qty ?? 0) || 0
    const unitPrice = Number(invoice.unitPrice ?? invoice.price ?? 0) || 0
    return {
      id: invoice.id ?? invoice.Id ?? invoice.invoiceId,
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
      if (!response.ok) throw new Error('Failed to fetch invoices')
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
      if (name === 'quantity') return { ...prev, quantity: Number.parseInt(value || '0', 10) || 0 }
      if (name === 'unitPrice') return { ...prev, unitPrice: Number.parseFloat(value || '0') || 0 }
      return { ...prev, [name]: value }
    })
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
      if (!response.ok) throw new Error('Failed to create purchase invoice')
      setForm({ vendorName: '', partName: '', quantity: 0, unitPrice: 0 })
      await fetchInvoices()
    } catch (err) {
      setError(err.message || 'Could not create invoice.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return
    setError('')
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete invoice')
      await fetchInvoices()
    } catch (err) {
      setError(err.message || 'Could not delete invoice.')
    }
  }

  const filtered = invoices.filter((item) => {
    const q = search.toLowerCase()
    return item.vendorName?.toLowerCase().includes(q) || item.partName?.toLowerCase().includes(q)
  })

  return (
    <div className="um-page">
      <div className="um-page-header">
        <div className="um-page-title-group">
          <div>
            <h1 className="um-page-title">Purchase Invoices</h1>
            <p className="um-page-subtitle">Create and manage vendor purchase invoices</p>
          </div>
        </div>
        <div className="um-header-actions">
          <div className="um-search-wrap">
            <Search size={14} className="um-search-icon" />
            <input className="um-search" type="text" placeholder="Search invoices…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {error && <div className="um-error-banner">{error}</div>}

      <div className="um-card" style={{ marginBottom: 20, padding: 20 }}>
        <h2 className="um-page-title" style={{ fontSize: 16, marginBottom: 16 }}>Create New Purchase Invoice</h2>
        <form onSubmit={handleSubmit}>
          <div className="um-header-actions" style={{ flexWrap: 'wrap' }}>
            <input className="um-search" style={{ width: 160 }} type="text" name="vendorName" placeholder="Vendor name" value={form.vendorName} onChange={handleChange} required />
            <input className="um-search" style={{ width: 160 }} type="text" name="partName" placeholder="Part name" value={form.partName} onChange={handleChange} required />
            <input className="um-search" style={{ width: 120 }} type="number" min="1" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
            <input className="um-search" style={{ width: 120 }} type="text" name="unitPrice" placeholder="Unit price" value={form.unitPrice} onChange={handleChange} required />
            <button className="um-btn um-btn--primary" type="submit">Create Invoice</button>
          </div>
        </form>
      </div>

      <div className="um-card">
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Part</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th className="um-th-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="um-state-cell">
                    <span className="um-table-spinner" />
                    <span className="um-state-text">Loading invoices…</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="um-state-cell">
                    <span className="um-state-text">{search ? 'No invoices match your search.' : 'No invoices found.'}</span>
                  </td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <tr key={invoice.id} className="um-row">
                    <td className="um-username">{invoice.vendorName || '—'}</td>
                    <td>{invoice.partName || '—'}</td>
                    <td>{invoice.quantity}</td>
                    <td>{invoice.unitPrice.toFixed(2)}</td>
                    <td>{(invoice.quantity * invoice.unitPrice).toFixed(2)}</td>
                    <td className="um-td-center">
                      <button type="button" className="um-action-btn um-action-btn--delete" onClick={() => handleDelete(invoice.id)} title="Delete invoice">
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

export default PurchaseInvoices
