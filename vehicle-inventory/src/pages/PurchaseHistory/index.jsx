
import { useState } from "react";
import { Search, History } from "lucide-react";
import "./index.css";

// dummy purchase history data so the page doesnt look empty
const mockHistory = [];

export default function PurchaseHistory() {

    // stores what user types in search box
    const [search, setSearch] = useState("");

    // stores which type filter is selected (All, Purchase, Service)
    const [filter, setFilter] = useState("All");

    // filters history based on search query and type filter
    const filtered = mockHistory.filter((h) => {
        const q = search.toLowerCase();
        const matchesSearch =
            h.customerName.toLowerCase().includes(q) ||
            h.vehicleNumber.toLowerCase().includes(q) ||
            h.description.toLowerCase().includes(q);

        const matchesFilter = filter === "All" || h.type === filter;

        return matchesSearch && matchesFilter;
    });

    // calculates total amount from filtered results
    const totalAmount = filtered.reduce((sum, h) => sum + h.amount, 0);

    return (
        <div className="ph-page">

            {/* page header */}
            <div className="ph-page-header">
                <div>
                    <h1 className="ph-page-title">Purchase and Service History</h1>
                    <p className="ph-page-subtitle">
                        {mockHistory.length} records found
                    </p>
                </div>

                <div className="ph-header-actions">

                    {/* filter buttons for Purchase and Service */}
                    <div className="ph-filter-group">
                        {["All", "Purchase", "Service"].map((type) => (
                            <button
                                key={type}
                                className={`ph-filter-btn ${filter === type ? "ph-filter-btn--active" : ""}`}
                                onClick={() => setFilter(type)}
                                type="button"
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* search bar */}
                    <div className="ph-search-wrap">
                        <Search size={14} className="ph-search-icon" />
                        <input
                            className="ph-search"
                            type="text"
                            placeholder="Search by customer, vehicle or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* stats cards */}
            <div className="ph-stats">
                <div className="ph-stat-card">
                    <h3>{mockHistory.length}</h3>
                    <p>Total Records</p>
                </div>
                <div className="ph-stat-card">
                    <h3>{filtered.length}</h3>
                    <p>Showing Results</p>
                </div>
                <div className="ph-stat-card">
                    <h3>Rs. {totalAmount.toLocaleString()}</h3>
                    <p>Total Amount</p>
                </div>
            </div>

            {/* history table */}
            <div className="ph-card">
                <div className="ph-table-wrap">
                    <table className="ph-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Customer Name</th>
                                <th>Vehicle Number</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* show empty state if no records found */}
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="ph-state-cell">
                                        <History size={32} className="ph-empty-icon" />
                                        <span className="ph-state-text">
                                            {search ? "No records match your search." : "No history found."}
                                        </span>
                                    </td>
                                </tr>
                            ) : (
                                // loop through filtered history and show each as a row
                                filtered.map((record, index) => (
                                    <tr key={record.id}>
                                        <td>{index + 1}</td>
                                        <td className="ph-customer-name">{record.customerName}</td>
                                        <td>{record.vehicleNumber}</td>
                                        <td>
                                            <span className={`ph-badge ${record.type === "Purchase" ? "ph-badge--purchase" : "ph-badge--service"}`}>
                                                {record.type}
                                            </span>
                                        </td>
                                        <td className="ph-description">{record.description}</td>
                                        <td className="ph-amount">Rs. {record.amount.toLocaleString()}</td>
                                        <td className="ph-date">{record.date}</td>
                                        <td>
                                            <span className="ph-badge ph-badge--completed">{record.status}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* footer showing count */}
                <div className="ph-table-footer">
                    Showing {filtered.length} of {mockHistory.length} records
                </div>
            </div>

        </div>
    );
}