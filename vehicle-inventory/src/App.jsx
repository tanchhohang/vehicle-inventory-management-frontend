import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Appointments from './pages/Appointments'
import Reviews from './pages/Reviews'
import PurchaseInvoices from './pages/PurchaseInvoices'
import CustomerReports from './pages/CustomerReports'

function App() {
  const styles = {
    app: {
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f9f9f9',
    },
    navbar: {
      display: 'flex',
      gap: 12,
      padding: 14,
      borderBottom: '1px solid #ddd',
      backgroundColor: '#fff',
      flexWrap: 'wrap',
    },
    link: {
      textDecoration: 'none',
      color: '#1f3b66',
      border: '1px solid #b8c7df',
      borderRadius: 6,
      padding: '8px 12px',
      backgroundColor: '#eef4ff',
    },
    content: {
      padding: 16,
    },
  }

  return (
    <div style={styles.app}>
      <nav style={styles.navbar}>
        <Link to="/appointments" style={styles.link}>Appointments</Link>
        <Link to="/reviews" style={styles.link}>Reviews</Link>
        <Link to="/purchase-invoices" style={styles.link}>Purchase Invoices</Link>
        <Link to="/customer-reports" style={styles.link}>Customer Reports</Link>
      </nav>

      <main style={styles.content}>
        <Routes>
          <Route path="/" element={<Navigate to="/appointments" replace />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/purchase-invoices" element={<PurchaseInvoices />} />
          <Route path="/customer-reports" element={<CustomerReports />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
