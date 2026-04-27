// App.jsx
// This is the main file of our React application.
// I set up the routing here so that each page has its own URL.
//
// I installed a package called react-router-dom to handle navigation.
// Command I used: npm install react-router-dom
// I needed this because without it, React cant navigate between pages.
// It works like a traffic controller - it looks at the URL and shows
// the correct page component.
//
// For example:
// /vendors  --> shows the Vendor Management page
//
// As our team adds more pages, we will add more Routes here.


import { BrowserRouter, Routes, Route } from 'react-router-dom'
import VendorPage from './pages/Vendor/VendorPage'
import './App.css'

function App() {
    return (
        // BrowserRouter wraps everything so routing works across the whole app
        <BrowserRouter>
            <Routes>
                {/* When user goes to /vendors, show the VendorPage component */}
                <Route path="/vendors" element={<VendorPage />} />

                {/* Other team members will add their routes here */}
            </Routes>
        </BrowserRouter>
    )
}

export default App