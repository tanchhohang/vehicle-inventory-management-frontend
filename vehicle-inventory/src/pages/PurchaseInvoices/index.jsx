import { useEffect, useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import '../UserManagement/index.css'

const API_BASE = 'http://localhost:5047/api/purchase-invoices'

const emptyItem = () => ({
  partId: '',
  partName: '',
  quantity: 1,
  unitPrice: 0,
})

const initialForm = () => ({
  vendorName: '',
  items: [emptyItem()],
})

function extractPartId(source) {
  if (!source || typeof source !== 'object') return null
  const nested = source.part ?? source.Part
  const raw =
    source.partId ??
    source.PartId ??
    source.partID ??
    source.PartID ??
    nested?.id ??
    nested?.Id ??
    nested?.partId ??
    nested?.PartId
  if (raw === null || raw === undefined || raw === '') return null
  return raw
}

function formatPartId(partId) {
  if (partId === null || partId === undefined || partId === '') return '—'
  return String(partId)
}

function formatMoney(amount) {
  const value = Number(amount)
  if (Number.isNaN(value)) return '—'
  return `Rs. ${value.toFixed(2)}`
}

function normalizeItemRow(invoice, item, index) {
  const vendorName = invoice.vendorName ?? invoice.VendorName ?? ''
  const invoiceId = invoice.id ?? invoice.Id ?? invoice.invoiceId
  const partId = extractPartId(item)
  const partName = item.partName ?? item.PartName ?? item.part?.name ?? item.Part?.Name ?? ''
  const quantity = Number(item.quantity ?? item.Quantity ?? 0) || 0
  const unitPrice = Number(item.unitPrice ?? item.UnitPrice ?? item.price ?? item.Price ?? 0) || 0

  return {
    rowKey: `${invoiceId}-${index}`,
    invoiceId,
    vendorName,
    partId,
    partName,
    quantity,
    unitPrice,
  }
}

function normalizeInvoicesForTable(data) {
  if (!Array.isArray(data)) return []

  return data.flatMap((invoice) => {
    const invoiceId = invoice.id ?? invoice.Id ?? invoice.invoiceId
    const items = invoice.items ?? invoice.Items ?? invoice.lineItems ?? invoice.LineItems ?? []

    if (!Array.isArray(items) || items.length === 0) {
      return [
        normalizeItemRow(
          invoice,
          {
            partId: extractPartId(invoice),
            partName: invoice.partName ?? invoice.PartName,
            quantity: invoice.quantity ?? invoice.Quantity,
            unitPrice: invoice.unitPrice ?? invoice.UnitPrice,
          },
          0
        ),
      ]
    }

    return items.map((item, index) => normalizeItemRow(invoice, item, index))
  })
}

function PurchaseInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initialForm)

  const fetchInvoices = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) throw new Error('Failed to fetch invoices')
      const data = await response.json()
      setInvoices(normalizeInvoicesForTable(data))
    } catch (err) {
      setError(err.message || 'Something went wrong while loading invoices.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleVendorChange = (event) => {
    setForm((prev) => ({ ...prev, vendorName: event.target.value }))
  }

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items]
      const item = { ...items[index] }
      if (field === 'partId') {
        item.partId = value
      } else if (field === 'quantity') {
        item.quantity = Number.parseInt(value || '0', 10) || 0
      } else if (field === 'unitPrice') {
        item.unitPrice = Number.parseFloat(value || '0') || 0
      } else {
        item[field] = value
      }
      items[index] = item
      return { ...prev, items }
    })
  }

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }))
  }

  const removeItem = (index) => {
    setForm((prev) => {
      if (prev.items.length <= 1) return prev
      return { ...prev, items: prev.items.filter((_, i) => i !== index) }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const payload = {
      vendorName: form.vendorName.trim(),
      items: form.items.map((item) => ({
        partId: Number.parseInt(String(item.partId), 10) || 0,
        partName: item.partName.trim(),
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
      })),
    }

    setSubmitting(true)
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to create purchase invoice')
      setForm(initialForm())
      await fetchInvoices()
    } catch (err) {
      setError(err.message || 'Could not create invoice.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (invoiceId) => {
    if (!invoiceId || !window.confirm('Delete this invoice?')) return
    setError('')
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(invoiceId)}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete invoice')
      await fetchInvoices()
    } catch (err) {
      setError(err.message || 'Could not delete invoice.')
    }
  }

  const filtered = invoices.filter((row) => {
    const q = search.toLowerCase()
    return (
      row.vendorName?.toLowerCase().includes(q) ||
      String(row.partId).includes(q) ||
      row.partName?.toLowerCase().includes(q)
    )
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
            <input
              className="um-search"
              type="text"
              placeholder="Search invoices…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="um-error-banner">{error}</div>}

      <div className="um-card" style={{ marginBottom: 20, padding: 20 }}>
        <h2 className="um-page-title" style={{ fontSize: 16, marginBottom: 16 }}>
          Create New Purchase Invoice
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label className="um-page-subtitle" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Vendor Name
            </label>
            <input
              className="um-search"
              style={{ width: '100%', maxWidth: 400 }}
              type="text"
              name="vendorName"
              placeholder="Vendor name"
              value={form.vendorName}
              onChange={handleVendorChange}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="um-page-subtitle" style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}>
              Items
            </label>

            {form.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  alignItems: 'flex-end',
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: index < form.items.length - 1 ? '1px solid var(--color-border, #dcdcdc)' : 'none',
                }}
              >
                <input
                  className="um-search"
                  style={{ width: 100 }}
                  type="number"
                  min="0"
                  placeholder="Part ID"
                  value={item.partId}
                  onChange={(e) => handleItemChange(index, 'partId', e.target.value)}
                  required
                />
                <input
                  className="um-search"
                  style={{ width: 160 }}
                  type="text"
                  placeholder="Part name"
                  value={item.partName}
                  onChange={(e) => handleItemChange(index, 'partName', e.target.value)}
                  required
                />
                <input
                  className="um-search"
                  style={{ width: 100 }}
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  required
                />
                <input
                  className="um-search"
                  style={{ width: 120 }}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Unit price"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  required
                />
                {form.items.length > 1 && (
                  <button
                    type="button"
                    className="um-btn um-btn--secondary"
                    onClick={() => removeItem(index)}
                    title="Remove item"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="um-header-actions" style={{ marginTop: 8 }}>
            <button type="button" className="um-btn um-btn--secondary" onClick={addItem}>
              <Plus size={15} />
              Add Item
            </button>
            <button className="um-btn um-btn--primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>

      <div className="um-card">
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Part ID</th>
                <th>Part Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Line Total</th>
                <th className="um-th-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="um-state-cell">
                    <span className="um-table-spinner" />
                    <span className="um-state-text">Loading invoices…</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="um-state-cell">
                    <span className="um-state-text">
                      {search ? 'No invoices match your search.' : 'No invoices found.'}
                    </span>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.rowKey} className="um-row">
                    <td className="um-username">{row.vendorName || '—'}</td>
                    <td>{formatPartId(row.partId)}</td>
                    <td>{row.partName || '—'}</td>
                    <td>{row.quantity}</td>
                    <td>{formatMoney(row.unitPrice)}</td>
                    <td>{formatMoney(row.quantity * row.unitPrice)}</td>
                    <td className="um-td-center">
                      <button
                        type="button"
                        className="um-action-btn um-action-btn--delete"
                        onClick={() => handleDelete(row.invoiceId)}
                        title="Delete invoice"
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

export default PurchaseInvoices
