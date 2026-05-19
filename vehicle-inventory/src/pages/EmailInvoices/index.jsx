import { useEffect, useState, useCallback } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import '../UserManagement/index.css'
import './index.css'

const SALES_API = 'http://localhost:5047/api/Sales'
const EMAIL_API = 'http://localhost:5047/api/InvoiceEmail/send'

function EmailInvoices() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sendingId, setSendingId] = useState(null)
  const [resultMap, setResultMap] = useState({})

  const loadSales = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(SALES_API)
      if (!response.ok) throw new Error('Failed to fetch sales')
      const data = await response.json()
      setSales(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Could not load sales.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSales()
  }, [loadSales])

  const handleSendEmail = async (saleId) => {
    setSendingId(saleId)
    try {
      const response = await fetch(`${EMAIL_API}/${saleId}`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to send email')
      setResultMap((prev) => ({ ...prev, [saleId]: { ok: true, msg: data.message } }))
    } catch (err) {
      setResultMap((prev) => ({ ...prev, [saleId]: { ok: false, msg: err.message } }))
    } finally {
      setSendingId(null)
    }
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="um-page">
      <div className="um-page-header">
        <div className="um-page-title-group">
          <div>
            <h1 className="um-page-title">Email Invoices</h1>
            <p className="um-page-subtitle">Send sale invoices directly to customers via email</p>
          </div>
        </div>
        <div className="um-header-actions">
          <button
            type="button"
            className="um-btn um-btn--ghost"
            onClick={loadSales}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'um-spin' : ''} />
          </button>
        </div>
      </div>

      {error && <div className="um-error-banner">{error}</div>}

      <div className="um-card">
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Customer ID</th>
                <th>Date</th>
                <th>Total (NPR)</th>
                <th>Payment</th>
                <th>Email Status</th>
                <th className="um-th-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="um-state-cell">
                    <span className="um-table-spinner" />
                    <span className="um-state-text">Loading sales…</span>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="um-state-cell">
                    <span className="um-state-text">No sales found.</span>
                  </td>
                </tr>
              ) : (
                sales.map((sale) => {
                  const result = resultMap[sale.id]
                  return (
                    <tr key={sale.id} className="um-row">
                      <td className="um-username">#{sale.id}</td>
                      <td>{sale.customerId}</td>
                      <td>{formatDate(sale.saleDate)}</td>
                      <td className="ei-amount">
                        {Number(sale.totalAmount).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`ei-paid-badge ${
                            sale.isPaid ? 'ei-paid-badge--paid' : 'ei-paid-badge--unpaid'
                          }`}
                        >
                          {sale.isPaid ? 'Paid' : 'Credit'}
                        </span>
                      </td>
                      <td>
                        {result ? (
                          <span
                            className={`ei-result-badge ${
                              result.ok ? 'ei-result-badge--ok' : 'ei-result-badge--err'
                            }`}
                          >
                            {result.msg}
                          </span>
                        ) : (
                          <span className="um-badge um-badge--customer">Not sent</span>
                        )}
                      </td>
                      <td className="um-td-center">
                        <button
                          type="button"
                          className="um-btn um-btn--primary ei-send-btn"
                          onClick={() => handleSendEmail(sale.id)}
                          disabled={sendingId === sale.id || result?.ok}
                          title="Send invoice email"
                        >
                          {sendingId === sale.id ? (
                            <span className="um-mini-spinner" />
                          ) : (
                            <Mail size={14} />
                          )}
                          {sendingId === sale.id ? 'Sending…' : 'Send'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EmailInvoices