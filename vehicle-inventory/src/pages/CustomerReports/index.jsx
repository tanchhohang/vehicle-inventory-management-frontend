import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import '../UserManagement/index.css'

const API_BASE = 'http://localhost:5047/api/reports'

const tabs = [
  { key: 'top-spenders', label: 'Top Spenders' },
  { key: 'regular-customers', label: 'Regular Customers' },
  { key: 'pending-credits', label: 'Pending Credits' },
]

function formatColumnLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()).trim()
}

function normalizeReportRow(item) {
  const row = {}
  Object.entries(item).forEach(([key, value]) => {
    row[key.charAt(0).toLowerCase() + key.slice(1)] = value
  })
  return row
}

function CustomerReports() {
  const [activeTab, setActiveTab] = useState('top-spenders')
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchReport = async (tabKey) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/${tabKey}`)
      if (!response.ok) throw new Error(`Failed to fetch report (${response.status})`)
      const data = await response.json()
      setReportData(Array.isArray(data) ? data.map(normalizeReportRow) : [])
    } catch (err) {
      console.error('Failed to fetch report:', err)
      setReportData([])
      setError(err.message || 'Could not load report data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport(activeTab)
  }, [activeTab])

  const columns = useMemo(() => (reportData.length > 0 ? Object.keys(reportData[0]) : []), [reportData])

  const filtered = reportData.filter((item) => {
    const q = search.toLowerCase()
    return Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(q))
  })

  const activeTabLabel = tabs.find((t) => t.key === activeTab)?.label ?? ''

  return (
    <div className="um-page">
      <div className="um-page-header">
        <div className="um-page-title-group">
          <div>
            <h1 className="um-page-title">Customer Reports</h1>
            <p className="um-page-subtitle">View insights on customer spending and activity</p>
          </div>
        </div>
        <div className="um-header-actions">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`um-btn ${activeTab === tab.key ? 'um-btn--primary' : 'um-btn--ghost'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
          <div className="um-search-wrap">
            <Search size={14} className="um-search-icon" />
            <input className="um-search" type="text" placeholder="Search report…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {error && <div className="um-error-banner">{error}</div>}

      <div className="um-card">
        <div style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--color-border, #dcdcdc)' }}>
          <span className="um-page-subtitle" style={{ fontWeight: 600, color: 'var(--color-text, #0f0f0f)' }}>{activeTabLabel}</span>
        </div>
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                {columns.length > 0 ? columns.map((col) => <th key={col}>{formatColumnLabel(col)}</th>) : <th>Data</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="um-state-cell">
                    <span className="um-table-spinner" />
                    <span className="um-state-text">Loading report…</span>
                  </td>
                </tr>
              ) : !error && filtered.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="um-state-cell">
                    <span className="um-state-text">{search ? 'No records match your search.' : 'No data available'}</span>
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item.id ?? index} className="um-row">
                    {columns.map((col) => (
                      <td key={col}>{String(item[col] ?? '—')}</td>
                    ))}
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

export default CustomerReports
