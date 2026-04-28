import { useState } from "react";
import { User, UserCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import "./index.css";
import { Link, useNavigate} from "react-router-dom";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

// API Integration Point
async function registerCustomer(payload) {
  const res = await fetch("http://localhost:5047/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: payload.firstName,
      lastName: payload.lastName,
      username: payload.username,
      email: payload.email,
      password: payload.password,
      role: "Customer",
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed.");
  return data;
}

export default function CustomerRegister() {
    const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [serverError, setServerError] = useState("");

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setServerError("");
    setStatus("loading");

    // Payload shape — add / rename fields to match your backend schema
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      role: "customer",
    };

    try {
      await registerCustomer(payload);
      setStatus("success");
      navigate("/login");
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
      setStatus("error");
    }
  };

  //  Main form
  return (
    <div className="cr-page">
      <div className="cr-card">
        {/* Header */}
        <div className="cr-card-header">
          <h1 className="cr-title">Register Account</h1>
          <p className="cr-subtitle">
            Fill in the details below to register a new account!
          </p>
        </div>

        {/* Fields */}
        <div className="cr-fields">
          {/* First + Last name */}
          <div className="cr-row">
            <Field label="First Name" icon={<User size={14} />}>
              <input
                className="cr-input"
                type="text"
                placeholder="John"
                value={form.firstName}
                onChange={update("firstName")}
                autoFocus
              />
            </Field>
            <Field label="Last Name" icon={<User size={14} />}>
              <input
                className="cr-input"
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
              className="cr-input"
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
              className="cr-input"
              type="email"
              placeholder="john.doe@example.com"
              value={form.email}
              onChange={update("email")}
            />
          </Field>

          {/* Password */}
          <Field label="Password" icon={<Lock size={14} />}>
            <div className="cr-input-wrap">
              <input
                className="cr-input cr-input--icon-right"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={form.password}
                onChange={update("password")}
              />
              <button
                className="cr-eye"
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
            <div className="cr-input-wrap">
              <input
                className="cr-input cr-input--icon-right"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
              />
              <button
                className="cr-eye"
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
        </div>

        {/* Server error */}
        {status === "error" && (
        <div className="cr-error-banner">{serverError}</div>
        )}


        {/* Actions */}
        <div className="cr-actions">
          <button
            className="cr-btn cr-btn--secondary"
            type="button"
            onClick={() => setForm(INITIAL_FORM)}
            disabled={status === "loading"}
          >
            Cancel
          </button>
          <button
            className="cr-btn cr-btn--primary"
            type="button"
            onClick={handleSubmit}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <span className="cr-spinner-row">
                <span className="cr-spinner" />
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </div>

        {/* Login link */}
        <p className="cr-login-link">
        Already have an account?{" "}
        <Link to="/login" className="cr-link">
            Sign in
        </Link>
        </p>
      </div>
    </div>
  );
}

/* Field wrapper */
function Field({ label, icon, children }) {
  return (
    <div className="cr-field">
      <label className="cr-label">
        <span className="cr-label-icon">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}