import { useState, useCallback, useEffect } from 'react'
import { BarChart2, RefreshCw } from 'lucide-react'
import '../UserManagement/index.css'
import './index.css'

const API_BASE = 'http://localhost:5047/api/financial-reports'

const TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'daily',   label: 'Daily'   },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly',  label: 'Yearly'  },
]

function fmtMoney(value) {
  return `Rs. ${Number(value ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function buildUrl(tab, params) {
  if (tab === 'summary') return `${API_BASE}/summary`
  if (tab === 'daily')   return `${API_BASE}/daily?date=${params.date}`
  if (tab === 'monthly') return `${API_BASE}/monthly?year=${params.year}&month=${params.month}`
  if (tab === 'yearly')  return `${API_BASE}/yearly?year=${params.year}`
  return `${API_BASE}/summary`
}

function FinancialReports() {
  const today = new Date()

  const [activeTab, setActiveTab] = useState('summary')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [params, setParams] = useState({
    date:  today.toISOString().split('T')[0],
    year:  today.getFullYear(),
    month: today.getMonth() + 1,
  })

  const fetchReport = useCallback(async (tab, currentParams) => {
    setLoading(true)
    setError('')
    setReport(null)
    try {
      const response = await fetch(buildUrl(tab, currentParams))
      if (!response.ok) throw new Error(`Failed to fetch ${tab} report`)
      const data = await response.json()
      setReport(data)
    } catch (err) {
      setError(err.message || 'Could not load report.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport(activeTab, params)
  }, [activeTab, fetchReport])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleLoad = () => {
    fetchReport(activeTab, params)
  }

  const profitClass =
    report && report.netProfit >= 0
      ? 'fr-stat-value fr-stat-value--profit'
      : 'fr-stat-value fr-stat-value--loss'

  return (
    <div className="um-page">
      <div className="um-page-header">
        <div className="um-page-title-group">
          <div>
            <h1 className="um-page-title">Financial Reports</h1>
            <p className="um-page-subtitle">View revenue, expenses, and profit summaries</p>
          </div>
        </div>
        <div className="um-header-actions">
          <button
            type="button"
            className="um-btn um-btn--ghost"
            onClick={handleLoad}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'um-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="fr-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`fr-tab${activeTab === tab.key ? ' fr-tab--active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'daily' && (
        <div className="fr-filters">
          <div className="fr-field">
            <label className="fr-label">Date</label>
            <input
              className="fr-input"
              type="date"
              value={params.date}
              onChange={(e) => setParams((p) => ({ ...p, date: e.target.value }))}
            />
          </div>
          <button
            type="button"
            className="um-btn um-btn--primary"
            onClick={handleLoad}
            disabled={loading}
          >
            <BarChart2 size={14} />
            Load Report
          </button>
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="fr-filters">
          <div className="fr-field">
            <label className="fr-label">Year</label>
            <input
              className="fr-input"
              type="number"
              value={params.year}
              min="2000"
              max="2100"
              onChange={(e) =>
                setParams((p) => ({ ...p, year: parseInt(e.target.value) || today.getFullYear() }))
              }
            />
          </div>
          <div className="fr-field">
            <label className="fr-label">Month</label>
            <input
              className="fr-input"
              type="number"
              value={params.month}
              min="1"
              max="12"
              onChange={(e) =>
                setParams((p) => ({ ...p, month: parseInt(e.target.value) || 1 }))
              }
            />
          </div>
          <button
            type="button"
            className="um-btn um-btn--primary"
            onClick={handleLoad}
            disabled={loading}
          >
            <BarChart2 size={14} />
            Load Report
          </button>
        </div>
      )}

      {activeTab === 'yearly' && (
        <div className="fr-filters">
          <div className="fr-field">
            <label className="fr-label">Year</label>
            <input
              className="fr-input"
              type="number"
              value={params.year}
              min="2000"
              max="2100"
              onChange={(e) =>
                setParams((p) => ({ ...p, year: parseInt(e.target.value) || today.getFullYear() }))
              }
            />
          </div>
          <button
            type="button"
            className="um-btn um-btn--primary"
            onClick={handleLoad}
            disabled={loading}
          >
            <BarChart2 size={14} />
            Load Report
          </button>
        </div>
      )}

      {error && <div className="um-error-banner">{error}</div>}

      {loading && (
        <div className="fr-loading-state">
          <span className="um-table-spinner" />
          Loading report…
        </div>
      )}

      {!loading && report && (
        <>
          <div className="fr-period-badge">
            {report.reportType} — {report.period}
          </div>

          <div className="fr-stats-grid">
            <div className="fr-stat-card">
              <span className="fr-stat-label">Total Revenue</span>
              <span className="fr-stat-value">{fmtMoney(report.totalRevenue)}</span>
            </div>
            <div className="fr-stat-card">
              <span className="fr-stat-label">Total Expenses</span>
              <span className="fr-stat-value fr-stat-value--expense">
                {fmtMoney(report.totalExpenses)}
              </span>
            </div>
            <div className="fr-stat-card">
              <span className="fr-stat-label">Total Discounts</span>
              <span className="fr-stat-value">{fmtMoney(report.totalDiscount)}</span>
            </div>
            <div className="fr-stat-card">
              <span className="fr-stat-label">Net Profit</span>
              <span className={profitClass}>{fmtMoney(report.netProfit)}</span>
            </div>
          </div>

          <div className="fr-breakdown-card">
            <div className="fr-breakdown-header">Sales Breakdown</div>
            <table className="fr-breakdown-table">
              <tbody>
                <tr>
                  <td className="fr-row-label">Total Sales</td>
                  <td>{report.totalSalesCount}</td>
                </tr>
                <tr>
                  <td className="fr-row-label">Paid Sales</td>
                  <td>{report.paidSalesCount}</td>
                </tr>
                <tr>
                  <td className="fr-row-label">Unpaid / Credit Sales</td>
                  <td>{report.unpaidSalesCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default FinancialReports