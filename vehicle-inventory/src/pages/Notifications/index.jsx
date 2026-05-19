import { useState } from 'react'
import { Bell, CreditCard, RefreshCw } from 'lucide-react'
import '../UserManagement/index.css'
import './index.css'

const API_BASE = 'http://localhost:5047/api/notification'

function Notifications() {
  const [lowStockLoading, setLowStockLoading] = useState(false)
  const [overdueLoading, setOverdueLoading] = useState(false)
  const [log, setLog] = useState([])

  const addLog = (message, type) => {
    setLog((prev) => [
      { message, type, time: new Date().toLocaleTimeString() },
      ...prev,
    ])
  }

  const triggerLowStock = async () => {
    setLowStockLoading(true)
    try {
      const response = await fetch(`${API_BASE}/test/low-stock`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to send low stock alert')
      addLog(data.message, 'success')
    } catch (err) {
      addLog(err.message || 'Failed to send low stock alert', 'error')
    } finally {
      setLowStockLoading(false)
    }
  }

  const triggerOverdueReminders = async () => {
    setOverdueLoading(true)
    try {
      const response = await fetch(`${API_BASE}/test/overdue-reminders`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to send overdue reminders')
      addLog(data.message, 'success')
    } catch (err) {
      addLog(err.message || 'Failed to send overdue reminders', 'error')
    } finally {
      setOverdueLoading(false)
    }
  }

  return (
    <div className="um-page">
      <div className="um-page-header">
        <div className="um-page-title-group">
          <div>
            <h1 className="um-page-title">Notifications & Reminders</h1>
            <p className="um-page-subtitle">Trigger system alerts and email reminders</p>
          </div>
        </div>
      </div>

      <div className="nm-actions-grid">
        <div className="nm-action-card">
          <div className="nm-icon-wrap nm-icon-wrap--warning">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="nm-action-title">Low Stock Alert</h2>
            <p className="nm-action-desc">
              Scans inventory for parts with fewer than 10 units and emails all
              admin accounts with the list of affected parts.
            </p>
          </div>
          <div className="nm-action-footer">
            <button
              type="button"
              className="um-btn um-btn--primary"
              onClick={triggerLowStock}
              disabled={lowStockLoading}
            >
              {lowStockLoading ? (
                <>
                  <span className="um-mini-spinner" />
                  Sending…
                </>
              ) : (
                <>
                  <Bell size={14} />
                  Send Alert
                </>
              )}
            </button>
          </div>
        </div>

        <div className="nm-action-card">
          <div className="nm-icon-wrap nm-icon-wrap--info">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="nm-action-title">Overdue Credit Reminders</h2>
            <p className="nm-action-desc">
              Finds customers with unpaid credit balances overdue by more than
              one month and sends each a personalised email reminder.
            </p>
          </div>
          <div className="nm-action-footer">
            <button
              type="button"
              className="um-btn um-btn--primary"
              onClick={triggerOverdueReminders}
              disabled={overdueLoading}
            >
              {overdueLoading ? (
                <>
                  <span className="um-mini-spinner" />
                  Sending…
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  Send Reminders
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="nm-log-card">
        <div className="nm-log-header">Activity Log</div>
        {log.length === 0 ? (
          <div className="nm-log-empty">
            No activity yet. Trigger an alert above to see results here.
          </div>
        ) : (
          log.map((entry, index) => (
            <div key={index} className="nm-log-item">
              <span className={`nm-log-dot nm-log-dot--${entry.type}`} />
              <span className="nm-log-msg">{entry.message}</span>
              <span className="nm-log-time">{entry.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Notifications