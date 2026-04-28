import { useState } from "react";
import { User, UserCircle, Mail, Lock, Eye, EyeOff, Phone, Car, X } from "lucide-react";
import "./index.css";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  role: "Customer",
  vehicleNumber: "",
};

const ROLES = ["Customer", "Admin", "Staff"];

async function registerUser(payload) {
  const res = await fetch("http://localhost:5047/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: payload.firstName,
      lastName: payload.lastName,
      username: payload.username,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: payload.password,
      role: payload.role,
      vehicleNumber: payload.vehicleNumber,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed.");
  return data;
}

export default function AddUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState(null);
  const [serverError, setServerError] = useState("");

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setServerError("");

    if (form.password !== form.confirmPassword) {
      setServerError("Passwords do not match.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      await registerUser(form);
      setStatus("success");
      onSuccess?.();
      onClose();
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
      setStatus("error");
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="aum-backdrop" onClick={handleBackdropClick}>
      <div className="aum-modal">
        {/* Header */}
        <div className="aum-header">
          <div>
            <h2 className="aum-title">Add New User</h2>
            <p className="aum-subtitle">Fill in the details to create a new account.</p>
          </div>
          <button className="aum-close" onClick={onClose} type="button" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="aum-body">
          <div className="aum-fields">
            {/* First + Last */}
            <div className="aum-row">
              <Field label="First Name" icon={<User size={14} />}>
                <input
                  className="aum-input"
                  type="text"
                  placeholder="John"
                  value={form.firstName}
                  onChange={update("firstName")}
                  autoFocus
                />
              </Field>
              <Field label="Last Name" icon={<User size={14} />}>
                <input
                  className="aum-input"
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={update("lastName")}
                />
              </Field>
            </div>

            {/* Username */}
            <Field label="Username" icon={<UserCircle size={14} />}>
              <input
                className="aum-input"
                type="text"
                placeholder="johndoe123"
                value={form.username}
                onChange={update("username")}
                autoComplete="off"
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" icon={<Mail size={14} />}>
              <input
                className="aum-input"
                type="email"
                placeholder="john.doe@example.com"
                value={form.email}
                onChange={update("email")}
              />
            </Field>

            {/* Phone */}
            <Field label="Phone Number" icon={<Phone size={14} />}>
              <input
                className="aum-input"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phoneNumber}
                onChange={update("phoneNumber")}
              />
            </Field>

            {/* Role + Vehicle */}
            <div className="aum-row">
              <Field label="Role" icon={<UserCircle size={14} />}>
                <select
                  className="aum-input aum-select"
                  value={form.role}
                  onChange={update("role")}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Vehicle Number" icon={<Car size={14} />}>
                <input
                  className="aum-input"
                  type="text"
                  placeholder="BA 1 PA 1234"
                  value={form.vehicleNumber}
                  onChange={update("vehicleNumber")}
                />
              </Field>
            </div>

            {/* Password */}
            <Field label="Password" icon={<Lock size={14} />}>
              <div className="aum-input-wrap">
                <input
                  className="aum-input aum-input--icon-right"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={update("password")}
                />
                <button
                  className="aum-eye"
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" icon={<Lock size={14} />}>
              <div className="aum-input-wrap">
                <input
                  className="aum-input aum-input--icon-right"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                />
                <button
                  className="aum-eye"
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
          </div>

          {status === "error" && (
            <div className="aum-error-banner">{serverError}</div>
          )}
        </div>

        {/* Footer */}
        <div className="aum-footer">
          <button
            className="aum-btn aum-btn--secondary"
            type="button"
            onClick={onClose}
            disabled={status === "loading"}
          >
            Cancel
          </button>
          <button
            className="aum-btn aum-btn--primary"
            type="button"
            onClick={handleSubmit}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <span className="aum-spinner-row">
                <span className="aum-spinner" />
                Adding...
              </span>
            ) : (
              "Add User"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="aum-field">
      <label className="aum-label">
        <span className="aum-label-icon">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}