

import { useState } from "react";
import { Search, Users } from "lucide-react";
import "./index.css";

// i added some dummy customers so the page doesnt look empty at first
const mockCustomers = [
  { id: 1, firstName: "Ram", lastName: "Sharma", email: "ram@email.com", phone: "9800000001", vehicleNumber: "BA 1 CHA 1234", points: 120 },
  { id: 2, firstName: "Sita", lastName: "Thapa", email: "sita@email.com", phone: "9800000002", vehicleNumber: "BA 2 PA 5678", points: 85 },
  { id: 3, firstName: "Hari", lastName: "Karki", email: "hari@email.com", phone: "9800000003", vehicleNumber: "BA 3 KHA 9012", points: 200 },
  { id: 4, firstName: "Gita", lastName: "Basnet", email: "gita@email.com", phone: "9800000004", vehicleNumber: "BA 1 JA 3456", points: 50 },
  { id: 5, firstName: "Bikash", lastName: "Rai", email: "bikash@email.com", phone: "9800000005", vehicleNumber: "BA 2 CHA 7890", points: 310 },
];

export default function SearchCustomers() {

  // stores what user types in the search box
  const [search, setSearch] = useState("");

  // filters customers based on search query
  // searches by first name, last name, email, phone or vehicle number
  const filtered = mockCustomers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.vehicleNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="sc-page">

      {/* page header */}
      <div className="sc-page-header">
        <div>
          <h1 className="sc-page-title">Search Customers</h1>
          <p className="sc-page-subtitle">
            {mockCustomers.length} customer{mockCustomers.length !== 1 ? "s" : ""} registered
          </p>
        </div>

        {/* search bar */}
        <div className="sc-header-actions">
          <div className="sc-search-wrap">
            <Search size={14} className="sc-search-icon" />
            <input
              className="sc-search"
              type="text"
              placeholder="Search by name, phone, vehicle number or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* stats cards */}
      <div className="sc-stats">
        <div className="sc-stat-card">
          <h3>{mockCustomers.length}</h3>
          <p>Total Customers</p>
        </div>
        <div className="sc-stat-card">
          <h3>{filtered.length}</h3>
          <p>Search Results</p>
        </div>
      </div>

      {/* customers table */}
      <div className="sc-card">
        <div className="sc-table-wrap">
          <table className="sc-table">
            <thead>
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Vehicle Number</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {/* show empty state if no customers found */}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="sc-state-cell">
                    <Users size={32} className="sc-empty-icon" />
                    <span className="sc-state-text">
                      {search ? "No customers match your search." : "No customers found."}
                    </span>
                  </td>
                </tr>
              ) : (
                // loop through filtered customers and show each as a row
                filtered.map((customer, index) => (
                  <tr key={customer.id}>
                    <td>{index + 1}</td>
                    <td className="sc-customer-name">{customer.firstName}</td>
                    <td>{customer.lastName}</td>
                    <td className="sc-email">{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.vehicleNumber}</td>
                    <td>
                      <span className="sc-points">{customer.points}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* total count at bottom */}
        <div className="sc-table-footer">
          Showing {filtered.length} of {mockCustomers.length} customers
        </div>
      </div>

    </div>
  );
}