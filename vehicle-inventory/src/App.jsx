import { Route, Routes, useLocation} from 'react-router-dom'
import Appointments from './pages/Appointments'
import Reviews from './pages/Reviews'
import PurchaseInvoices from './pages/PurchaseInvoices'
import CustomerReports from './pages/CustomerReports'
import CustomerRegister from "./pages/Authentication/customer-register";
import Login from "./pages/Authentication/customer-login";
import Parts from './pages/Parts'
import Sales from './pages/Sales'
import VendorPage from './pages/Vendor/VendorPage'
import UserManagement from './pages/UserManagement'
import Navbar from './common-components/NavBar'

function App() {
  const location = useLocation();
  const hideNav = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNav && <Navbar />}
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<CustomerRegister />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/purchase-invoices" element={<PurchaseInvoices />} />
      <Route path="/customer-reports" element={<CustomerReports />} />
      <Route path="/parts" element={<Parts />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/vendors" element={<VendorPage />} />
      <Route path="/user-management" element={<UserManagement />} />
    </Routes>
    </>
  )
}

export default App;
