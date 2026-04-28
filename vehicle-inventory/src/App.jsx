import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import CustomerRegister from './pages/CustomerRegister'
import Appointments from './pages/Appointments'
import Reviews from './pages/Reviews'
import PurchaseInvoices from './pages/PurchaseInvoices'
import CustomerReports from './pages/CustomerReports'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<CustomerRegister />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/purchase-invoices" element={<PurchaseInvoices />} />
      <Route path="/customer-reports" element={<CustomerReports />} />
    </Routes>
  )
}

export default App
