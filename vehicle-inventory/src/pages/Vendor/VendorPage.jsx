// VendorPage.jsx
// I made this page to manage vendors (suppliers who give us vehicle parts)
// This page lets admin: see all vendors, add new ones, edit and delete them
// I also added a search bar so you can find vendors quickly
//
// Author: Sneha Agrawal
// Date: April 2026

import { useState } from "react";
import "./VendorPage.css";

// I added two vendors by default just so the page doesnt look empty at first
const initialVendors = [
    { id: 1, name: "Speedy Parts Co.", email: "speedy@parts.com", phone: "9800000001", address: "Kathmandu, Nepal" },
    { id: 2, name: "Auto World Suppliers", email: "autoworld@supply.com", phone: "9800000002", address: "Lalitpur, Nepal" },
];

function VendorPage() {

    // this holds the list of all vendors
    const [vendors, setVendors] = useState(initialVendors);

    // this controls if the add/edit form is open or closed
    const [showForm, setShowForm] = useState(false);

    // this remembers which vendor i am editing
    // if its null it means i am adding a new vendor
    const [editingVendor, setEditingVendor] = useState(null);

    // this stores whatever the user types in the search box
    const [searchQuery, setSearchQuery] = useState("");

    // this stores what the user types in the form fields
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: ""
    });

    // this stores error messages if the user fills the form wrong
    const [errors, setErrors] = useState({});

    // I wrote this function to check if the form is filled correctly
    // it checks each field and returns errors if something is wrong
    const validate = () => {
        const newErrors = {};

        if (!form.name.trim())
            newErrors.name = "Vendor name is required.";

        if (!form.email.trim())
            newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(form.email))
            newErrors.email = "Invalid email format.";

        // phone must be exactly 10 digits
        if (!form.phone.trim())
            newErrors.phone = "Phone number is required.";
        else if (!/^\d{10}$/.test(form.phone))
            newErrors.phone = "Phone must be 10 digits.";

        if (!form.address.trim())
            newErrors.address = "Address is required.";

        return newErrors;
    };

    // whenever user types in a field, i update the form state
    // i also clear the error for that field so it doesnt stay red
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    // this runs when user clicks the Add Vendor button
    // i clear the form and open it fresh
    const handleAddNew = () => {
        setEditingVendor(null);
        setForm({ name: "", email: "", phone: "", address: "" });
        setErrors({});
        setShowForm(true);
    };

    // this runs when user clicks Edit on a vendor
    // i fill the form with that vendors existing data
    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setForm({
            name: vendor.name,
            email: vendor.email,
            phone: vendor.phone,
            address: vendor.address
        });
        setErrors({});
        setShowForm(true);
    };

    // this runs when user clicks Save Vendor or Update Vendor
    // first i validate, then either update or add the vendor
    const handleSave = () => {
        const validationErrors = validate();

        // if there are errors, show them and dont save
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (editingVendor) {
            // if we are editing, replace the old vendor with new data
            setVendors(vendors.map((v) =>
                v.id === editingVendor.id ? { ...v, ...form } : v
            ));
        } else {
            // if we are adding, create a new vendor with a unique id
            // i used Date.now() to generate a unique id automatically
            const newVendor = { id: Date.now(), ...form };
            setVendors([...vendors, newVendor]);
        }

        // close the form and clear everything after saving
        setShowForm(false);
        setForm({ name: "", email: "", phone: "", address: "" });
        setEditingVendor(null);
    };

    // this runs when user clicks Delete
    // i added a confirm popup so user doesnt delete by accident
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this vendor?")) {
            setVendors(vendors.filter((v) => v.id !== id));
        }
    };

    // this filters the vendor list based on what user typed in search
    // it checks name, email and phone number
    const filteredVendors = vendors.filter((v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.phone.includes(searchQuery)
    );

    return (
        <div className="vendor-container">
            <div className="vendor-inner">

                {/* header section with page title and add button */}
                <div className="vendor-header">
                    <div className="vendor-header-left">
                        <h1>Vendor Management</h1>
                        <p>Manage all your vehicle parts suppliers</p>
                    </div>
                    <button className="btn-primary" onClick={handleAddNew}>
                        + Add Vendor
                    </button>
                </div>

                {/* i added these stat cards to show total vendors and search results count */}
                <div className="vendor-stats">
                    <div className="stat-card">
                        <h3>{vendors.length}</h3>
                        <p>Total Vendors</p>
                    </div>
                    <div className="stat-card">
                        <h3>{filteredVendors.length}</h3>
                        <p>Showing Results</p>
                    </div>
                </div>

                {/* search bar - filters vendors as user types */}
                <div className="vendor-search">
                    <input
                        type="text"
                        placeholder="Search vendors by name, email or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* this form only shows up when user clicks Add Vendor or Edit */}
                {showForm && (
                    <div className="vendor-form-card">
                        <h2>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</h2>

                        {/* i used a 2 column grid layout for the form fields */}
                        <div className="form-grid">

                            {/* vendor name field */}
                            <div className="form-group">
                                <label>Vendor Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter vendor name"
                                />
                                {/* show error message if name is empty */}
                                {errors.name && <span className="error">{errors.name}</span>}
                            </div>

                            {/* email field */}
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                />
                                {errors.email && <span className="error">{errors.email}</span>}
                            </div>

                            {/* phone field - must be 10 digits */}
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit phone number"
                                />
                                {errors.phone && <span className="error">{errors.phone}</span>}
                            </div>

                            {/* address field */}
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Enter address"
                                />
                                {errors.address && <span className="error">{errors.address}</span>}
                            </div>

                        </div>

                        {/* cancel closes the form, save adds or updates the vendor */}
                        <div className="form-actions">
                            <button className="btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleSave}>
                                {editingVendor ? "Update Vendor" : "Save Vendor"}
                            </button>
                        </div>
                    </div>
                )}

                {/* table that shows all vendors */}
                <div className="vendor-table-card">
                    <table className="vendor-table">
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
                            {/* if no vendors found after search, show this message */}
                            {filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-data">
                                        No vendors found.
                                    </td>
                                </tr>
                            ) : (
                                // loop through all vendors and show each as a row
                                filteredVendors.map((vendor, index) => (
                                    <tr key={vendor.id}>
                                        <td>{index + 1}</td>
                                        <td>{vendor.name}</td>
                                        <td>{vendor.email}</td>
                                        <td>{vendor.phone}</td>
                                        <td>{vendor.address}</td>
                                        <td>
                                            {/* edit button opens the form with this vendors data */}
                                            <button className="btn-edit" onClick={() => handleEdit(vendor)}>
                                                Edit
                                            </button>
                                            {/* delete button removes this vendor */}
                                            <button className="btn-delete" onClick={() => handleDelete(vendor.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* shows count at the bottom of the table */}
                    <p className="vendor-count">Total Vendors: {filteredVendors.length}</p>
                </div>

            </div> {/* end of vendor-inner */}
        </div>   // end of vendor-container
    );
}

export default VendorPage;