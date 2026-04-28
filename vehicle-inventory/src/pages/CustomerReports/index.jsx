import { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:5047/api/reports'

const tabs = [
  { key: 'top-spenders', label: 'Top Spenders' },
  { key: 'regular-customers', label: 'Regular Customers' },
  { key: 'pending-credits', label: 'Pending Credits' },
]

const styles = {
  page: { maxWidth: 900, margin: '0 auto', padding: 20, fontFamily: 'Arial, sans-serif' },
  section: { marginBottom: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8 },
  tabs: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tabButton: { padding: '8px 12px', border: '1px solid #999', borderRadius: 6, cursor: 'pointer', background: '#fff' },
  activeTab: { background: '#eaf3ff', border: '1px solid #4a90e2' },
  card: { border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10, background: '#fafafa' },
  muted: { color: '#666' },
  error: { color: '#b00020' },
}

function CustomerReports() {
  const [activeTab, setActiveTab] = useState('top-spenders')
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReport = async (tabKey) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/${tabKey}`)
      if (!response.ok) {
        throw new Error('Failed to fetch report')
      }
      const data = await response.json()
      setReportData(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Could not load report data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport(activeTab)
  }, [activeTab])

  return (
    <div style={styles.page}>
      <h1>Customer Reports</h1>

      <section style={styles.section}>
        <h2>Reports</h2>

        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.key ? styles.activeTab : {}),
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && <p style={styles.muted}>Loading report...</p>}
        {error && <p style={styles.error}>{error}</p>}
        {!loading && reportData.length === 0 && <p style={styles.muted}>No report data available.</p>}

        {reportData.map((item, index) => (
          <div key={item.id || index} style={styles.card}>
            {Object.entries(item).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {String(value)}
              </p>
            ))}
          </div>
        ))}
      </section>
    </div>
  )
}

export default CustomerReports
