
import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Store } from "lucide-react";
import "./VendorPage.css";

// i added two vendors by default so the page doesnt look empty at first
const initialVendors = [
    { id: 1, name: "Speedy Parts Co.", email: "speedy@parts.com", phone: "9800000001", address: "Kathmandu, Nepal" },
    { id: 2, name: "Auto World Suppliers", email: "autoworld@supply.com", phone: "9800000002", address: "Lalitpur, Nepal" },
];

export default function VendorPage() {

    // list of all vendors
    const [vendors, setVendors] = useState(initialVendors);

    // controls whether the add/edit form is visible
    const [showForm, setShowForm] = useState(false);

    // stores which vendor is being edited (null means adding new)
    const [editingVendor, setEditingVendor] = useState(null);

    // stores what user types in search box
    const [search, setSearch] = useState("");

    // stores form field values
    const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

    // stores validation error messages
    const [errors, setErrors] = useState({});

    // checks if all form fields are filled correctly before saving
    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Vendor name is required.";
        if (!form.email.trim()) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format.";
        if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
        else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Phone must be 10 digits.";
        if (!form.address.trim()) newErrors.address = "Address is required.";
        return newErrors;
    };

    // updates form state when user types in any field
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    // opens form for adding a new vendor
    const handleAddNew = () => {
        setEditingVendor(null);
        setForm({ name: "", email: "", phone: "", address: "" });
        setErrors({});
        setShowForm(true);
    };

    // opens form with existing vendor data for editing
    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setForm({ name: vendor.name, email: vendor.email, phone: vendor.phone, address: vendor.address });
        setErrors({});
        setShowForm(true);
    };

    // saves the vendor - either adds new or updates existing
    const handleSave = () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (editingVendor) {
            // update existing vendor
            setVendors(vendors.map((v) => v.id === editingVendor.id ? { ...v, ...form } : v));
        } else {
            // add new vendor with unique id using timestamp
            setVendors([...vendors, { id: Date.now(), ...form }]);
        }

        setShowForm(false);
        setForm({ name: "", email: "", phone: "", address: "" });
        setEditingVendor(null);
    };

    // deletes a vendor after confirmation
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this vendor?")) {
            setVendors(vendors.filter((v) => v.id !== id));
        }
    };

    // filters vendors based on search query
    const filtered = vendors.filter((v) => {
        const q = search.toLowerCase();
        return (
            v.name.toLowerCase().includes(q) ||
            v.email.toLowerCase().includes(q) ||
            v.phone.includes(q) ||
            v.address.toLowerCase().includes(q)
        );
    });

    return (
        <div className="vp-page">

            {/* page header with title and action buttons */}
            <div className="vp-page-header">
                <div>
                    <h1 className="vp-page-title">Vendor Management</h1>
                    <p className="vp-page-subtitle">
                        {vendors.length} vendor{vendors.length !== 1 ? "s" : ""} registered
                    </p>
                </div>

                <div className="vp-header-actions">
                    {/* search bar */}
                    <div className="vp-search-wrap">
                        <Search size={14} className="vp-search-icon" />
                        <input
                            className="vp-search"
                            type="text"
                            placeholder="Search vendors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* add vendor button */}
                    <button className="vp-btn vp-btn--primary" onClick={handleAddNew} type="button">
                        <Plus size={15} />
                        Add Vendor
                    </button>
                </div>
            </div>

            {/* stats cards showing total and filtered count */}
            <div className="vp-stats">
                <div className="vp-stat-card">
                    <h3>{vendors.length}</h3>
                    <p>Total Vendors</p>
                </div>
                <div className="vp-stat-card">
                    <h3>{filtered.length}</h3>
                    <p>Showing Results</p>
                </div>
            </div>

            {/* add or edit form - only shows when showForm is true */}
            {showForm && (
                <div className="vp-form-card">
                    <h2>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</h2>

                    <div className="vp-form-grid">

                        {/* vendor name field */}
                        <div className="vp-form-group">
                            <label>Vendor Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter vendor name"
                            />
                            {errors.name && <span className="vp-error">{errors.name}</span>}
                        </div>

                        {/* email field */}
                        <div className="vp-form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                            />
                            {errors.email && <span className="vp-error">{errors.email}</span>}
                        </div>

                        {/* phone field */}
                        <div className="vp-form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Enter 10 digit phone number"
                            />
                            {errors.phone && <span className="vp-error">{errors.phone}</span>}
                        </div>

                        {/* address field */}
                        <div className="vp-form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                            />
                            {errors.address && <span className="vp-error">{errors.address}</span>}
                        </div>

                    </div>

                    {/* form buttons */}
                    <div className="vp-form-actions">
                        <button className="vp-btn vp-btn--secondary" onClick={() => setShowForm(false)} type="button">
                            Cancel
                        </button>
                        <button className="vp-btn vp-btn--primary" onClick={handleSave} type="button">
                            {editingVendor ? "Update Vendor" : "Save Vendor"}
                        </button>
                    </div>
                </div>
            )}

            {/* vendor table */}
            <div className="vp-card">
                <div className="vp-table-wrap">
                    <table className="vp-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Vendor Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* show empty state if no vendors found */}
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="vp-state-cell">
                                        <Store size={32} className="vp-empty-icon" />
                                        <span className="vp-state-text">
                                            {search ? "No vendors match your search." : "No vendors found."}
                                        </span>
                                    </td>
                                </tr>
                            ) : (
                                // loop through filtered vendors and show each as a row
                                filtered.map((vendor, index) => (
                                    <tr key={vendor.id}>
                                        <td>{index + 1}</td>
                                        <td className="vp-vendor-name">{vendor.name}</td>
                                        <td className="vp-email">{vendor.email}</td>
                                        <td>{vendor.phone}</td>
                                        <td>{vendor.address}</td>
                                        <td>
                                            {/* edit button opens form with vendor data */}
                                            <button
                                                className="vp-action-btn vp-action-btn--edit"
                                                onClick={() => handleEdit(vendor)}
                                                title="Edit vendor"
                                                type="button"
                                            >
                                                <Pencil size={14} />
                                            </button>

                                            {/* delete button removes vendor */}
                                            <button
                                                className="vp-action-btn vp-action-btn--delete"
                                                onClick={() => handleDelete(vendor.id)}
                                                title="Delete vendor"
                                                type="button"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* total count at bottom of table */}
                <div className="vp-table-footer">
                    Total Vendors: {filtered.length}
                </div>
            </div>

        </div>
    );
}