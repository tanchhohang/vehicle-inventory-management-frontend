import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Plus, X, RefreshCw, Tag } from "lucide-react";
import "./index.css";

const SALES_API = "http://localhost:5047/api/Sales";
const PARTS_API = "http://localhost:5047/api/Parts";

export default function Sales() {
    const [sales, setSales] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [customerId, setCustomerId] = useState("");
    const [staffId, setStaffId] = useState("");
    const [items, setItems] = useState([{ partId: "", quantity: "" }]);

    const loadSales = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(SALES_API);
            if (!res.ok) throw new Error("Failed to fetch sales.");
            setSales(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadParts = useCallback(async () => {
        try {
            const res = await fetch(PARTS_API);
            if (!res.ok) throw new Error("Failed to fetch parts.");
            setParts(await res.json());
        } catch (err) {
            setError(err.message);
        }
    }, []);

    useEffect(() => { loadSales(); loadParts(); }, [loadSales, loadParts]);

    function openModal() {
        setCustomerId("");
        setStaffId("");
        setItems([{ partId: "", quantity: "" }]);
        setShowModal(true);
    }

    function addItem() { setItems([...items, { partId: "", quantity: "" }]); }
    function removeItem(i) { setItems(items.filter((_, idx) => idx !== i)); }
    function updateItem(i, field, value) {
        const updated = [...items];
        updated[i][field] = value;
        setItems(updated);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        const body = {
            customerId: parseInt(customerId),
            staffId: parseInt(staffId),
            items: items.map(i => ({ partId: parseInt(i.partId), quantity: parseInt(i.quantity) }))
        };
        try {
            const res = await fetch(SALES_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (!res.ok) {
                const err = await res.text();
                throw new Error(err);
            }
            const sale = await res.json();
            setShowModal(false);
            loadSales();
            setSuccessMsg(`Sale #${sale.id} created! Total: NPR ${Number(sale.totalAmount).toLocaleString()}${sale.loyaltyDiscountApplied ? " — 10% loyalty discount applied!" : ""}`);
            setTimeout(() => setSuccessMsg(""), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="sm-page">
            {/* Header */}
            <div className="sm-page-header">
                <div>
                    <h1 className="sm-page-title">Sales & Invoices</h1>
                    <p className="sm-page-subtitle">{sales.length} sale{sales.length !== 1 ? "s" : ""} recorded</p>
                </div>
                <div className="sm-header-actions">
                    <button className="sm-btn sm-btn--ghost" onClick={loadSales} disabled={loading} title="Refresh">
                        <RefreshCw size={15} className={loading ? "sm-spin" : ""} />
                    </button>
                    <button className="sm-btn sm-btn--primary" onClick={openModal}>
                        <Plus size={15} /> New Sale
                    </button>
                </div>
            </div>

            {error && <div className="sm-error-banner">{error}</div>}
            {successMsg && <div className="sm-success-banner">{successMsg}</div>}

            {/* Table */}
            <div className="sm-card">
                <div className="sm-table-wrap">
                    <table className="sm-table">
                        <thead>
                        <tr>
                            <th>Sale ID</th>
                            <th>Customer ID</th>
                            <th>Staff ID</th>
                            <th>Date</th>
                            <th className="sm-th-right">Subtotal</th>
                            <th className="sm-th-right">Discount</th>
                            <th className="sm-th-right">Total</th>
                            <th className="sm-th-center">Loyalty</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="sm-state-cell"><span className="sm-table-spinner" /><span className="sm-state-text">Loading sales…</span></td></tr>
                        ) : sales.length === 0 ? (
                            <tr><td colSpan={8} className="sm-state-cell"><ShoppingCart size={32} className="sm-empty-icon" /><span className="sm-state-text">No sales recorded yet.</span></td></tr>
                        ) : (
                            sales.map(s => (
                                <tr key={s.id} className="sm-row">
                                    <td className="sm-id">#{s.id}</td>
                                    <td>{s.customerId}</td>
                                    <td>{s.staffId}</td>
                                    <td className="sm-date">{new Date(s.saleDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                                    <td className="sm-td-right">NPR {Number(s.subTotal).toLocaleString()}</td>
                                    <td className="sm-td-right sm-discount">{s.discountAmount > 0 ? `- NPR ${Number(s.discountAmount).toLocaleString()}` : "—"}</td>
                                    <td className="sm-td-right sm-total">NPR {Number(s.totalAmount).toLocaleString()}</td>
                                    <td className="sm-td-center">
                                        {s.loyaltyDiscountApplied
                                            ? <span className="sm-badge sm-badge--loyalty"><Tag size={10} /> 10% off</span>
                                            : <span className="sm-badge sm-badge--none">—</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="sm-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="sm-modal" onClick={e => e.stopPropagation()}>
                        <div className="sm-modal-header">
                            <h2 className="sm-modal-title">Create New Sale</h2>
                            <button className="sm-modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="sm-modal-form">
                            <div className="sm-field-row">
                                <div className="sm-field">
                                    <label className="sm-label">Customer ID *</label>
                                    <input className="sm-input" type="number" value={customerId} onChange={e => setCustomerId(e.target.value)} required placeholder="e.g. 1" min="1" />
                                </div>
                                <div className="sm-field">
                                    <label className="sm-label">Staff ID *</label>
                                    <input className="sm-input" type="number" value={staffId} onChange={e => setStaffId(e.target.value)} required placeholder="e.g. 1" min="1" />
                                </div>
                            </div>

                            <div className="sm-items-section">
                                <div className="sm-items-header">
                                    <span className="sm-label">Items *</span>
                                    <button type="button" className="sm-btn-add-item" onClick={addItem}><Plus size={13} /> Add Item</button>
                                </div>
                                {items.map((item, i) => (
                                    <div key={i} className="sm-item-row">
                                        <select className="sm-select" value={item.partId} onChange={e => updateItem(i, "partId", e.target.value)} required>
                                            <option value="">Select Part</option>
                                            {parts.map(p => <option key={p.id} value={p.id}>{p.name} — NPR {Number(p.price).toLocaleString()} (Stock: {p.stockQuantity})</option>)}
                                        </select>
                                        <input className="sm-input sm-qty-input" type="number" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} required placeholder="Qty" min="1" />
                                        {items.length > 1 && (
                                            <button type="button" className="sm-remove-item" onClick={() => removeItem(i)}><X size={14} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="sm-loyalty-note">
                                <Tag size={13} /> Customers spending over NPR 5,000 automatically receive a 10% loyalty discount.
                            </div>

                            <div className="sm-modal-footer">
                                <button type="button" className="sm-btn sm-btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="sm-btn sm-btn--primary" disabled={submitting}>
                                    {submitting ? "Processing…" : "Create Sale"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}