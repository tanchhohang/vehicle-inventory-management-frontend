import { useState, useEffect, useCallback } from "react";
import { Package, Plus, Trash2, Pencil, Search, RefreshCw, X } from "lucide-react";
import "./index.css";

const BASE = "http://localhost:5047/api/Parts";

export default function Parts() {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editPart, setEditPart] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [form, setForm] = useState({ name: "", description: "", category: "", price: "", stockQuantity: "" });
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const loadParts = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(BASE);
            if (!res.ok) throw new Error("Failed to fetch parts.");
            setParts(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadParts(); }, [loadParts]);

    function openAdd() {
        setEditPart(null);
        setForm({ name: "", description: "", category: "", price: "", stockQuantity: "" });
        setShowModal(true);
    }

    function openEdit(part) {
        setEditPart(part);
        setForm({ name: part.name, description: part.description || "", category: part.category || "", price: part.price, stockQuantity: part.stockQuantity });
        setShowModal(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        const body = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity) };
        try {
            if (editPart) {
                const res = await fetch(`${BASE}/${editPart.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                if (!res.ok) throw new Error("Failed to update part.");
                setSuccessMsg("Part updated successfully.");
            } else {
                const res = await fetch(BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                if (!res.ok) throw new Error("Failed to add part.");
                setSuccessMsg("Part added successfully.");
            }
            setShowModal(false);
            loadParts();
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this part?")) return;
        setDeletingId(id);
        try {
            const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete part.");
            setParts(prev => prev.filter(p => p.id !== id));
            setSuccessMsg("Part deleted successfully.");
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    }

    const filtered = parts.filter(p => {
        const q = search.toLowerCase();
        return p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    });

    return (
        <div className="pm-page">
            {/* Header */}
            <div className="pm-page-header">
                <div>
                    <h1 className="pm-page-title">Parts Management</h1>
                    <p className="pm-page-subtitle">{parts.length} part{parts.length !== 1 ? "s" : ""} in inventory</p>
                </div>
                <div className="pm-header-actions">
                    <button className="pm-btn pm-btn--ghost" onClick={loadParts} disabled={loading} title="Refresh">
                        <RefreshCw size={15} className={loading ? "pm-spin" : ""} />
                    </button>
                    <div className="pm-search-wrap">
                        <Search size={14} className="pm-search-icon" />
                        <input className="pm-search" type="text" placeholder="Search parts…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="pm-btn pm-btn--primary" onClick={openAdd}>
                        <Plus size={15} /> Add Part
                    </button>
                </div>
            </div>

            {error && <div className="pm-error-banner">{error}</div>}
            {successMsg && <div className="pm-success-banner">{successMsg}</div>}

            {/* Table */}
            <div className="pm-card">
                <div className="pm-table-wrap">
                    <table className="pm-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th className="pm-th-center">Price (NPR)</th>
                            <th className="pm-th-center">Stock</th>
                            <th className="pm-th-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="pm-state-cell"><span className="pm-table-spinner" /><span className="pm-state-text">Loading parts…</span></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="pm-state-cell"><Package size={32} className="pm-empty-icon" /><span className="pm-state-text">{search ? "No parts match your search." : "No parts found."}</span></td></tr>
                        ) : (
                            filtered.map(p => (
                                <tr key={p.id} className="pm-row">
                                    <td className="pm-name">{p.name}</td>
                                    <td>{p.category || "—"}</td>
                                    <td className="pm-desc">{p.description || "—"}</td>
                                    <td className="pm-td-center">{Number(p.price).toLocaleString()}</td>
                                    <td className="pm-td-center">
                      <span className={`pm-stock-badge ${p.stockQuantity < 10 ? "pm-stock-badge--low" : "pm-stock-badge--ok"}`}>
                        {p.stockQuantity}
                      </span>
                                    </td>
                                    <td className="pm-td-center">
                                        <div className="pm-actions">
                                            <button className="pm-action-btn pm-action-btn--edit" onClick={() => openEdit(p)} title="Edit"><Pencil size={14} /></button>
                                            <button className="pm-action-btn pm-action-btn--delete" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} title="Delete">
                                                {deletingId === p.id ? <span className="pm-mini-spinner pm-mini-spinner--danger" /> : <Trash2 size={14} />}
                                            </button>
                                        </div>
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
                <div className="pm-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="pm-modal" onClick={e => e.stopPropagation()}>
                        <div className="pm-modal-header">
                            <h2 className="pm-modal-title">{editPart ? "Edit Part" : "Add New Part"}</h2>
                            <button className="pm-modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="pm-modal-form">
                            <div className="pm-field">
                                <label className="pm-label">Name *</label>
                                <input className="pm-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Engine Filter" />
                            </div>
                            <div className="pm-field">
                                <label className="pm-label">Category</label>
                                <input className="pm-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Engine, Brakes" />
                            </div>
                            <div className="pm-field">
                                <label className="pm-label">Description</label>
                                <input className="pm-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
                            </div>
                            <div className="pm-field-row">
                                <div className="pm-field">
                                    <label className="pm-label">Price (NPR) *</label>
                                    <input className="pm-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required placeholder="0" min="0" />
                                </div>
                                <div className="pm-field">
                                    <label className="pm-label">Stock Quantity *</label>
                                    <input className="pm-input" type="number" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} required placeholder="0" min="0" />
                                </div>
                            </div>
                            <div className="pm-modal-footer">
                                <button type="button" className="pm-btn pm-btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="pm-btn pm-btn--primary" disabled={submitting}>
                                    {submitting ? "Saving…" : editPart ? "Update Part" : "Add Part"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}