import { useState } from "react";
import { UserCircle, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate} from "react-router-dom";
import "../customer-register/index.css";

const INITIAL_FORM = {
  usernameOrEmail: "",
  password: "",
};

async function loginCustomer(payload) {
  const res = await fetch("http://localhost:5047/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usernameOrEmail: payload.usernameOrEmail,
      password: payload.password,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed.");
  return data;
}

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState(null); // null | "loading" | "error"
    const [serverError, setServerError] = useState("");

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setServerError("");
    setStatus("loading");

    const payload = {
      usernameOrEmail: form.usernameOrEmail,
      password: form.password,
    };

    try {
      await loginCustomer(payload);
      setStatus(null);
      navigate("/user-management"); // redirect after login
    } catch (err) {
      setServerError(err.message || "Invalid credentials. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="cr-page">
      <div className="cr-card">
        {/* Header */}
        <div className="cr-card-header">
          <h1 className="cr-title">Welcome Back !</h1>
          <p className="cr-subtitle">Enter your credentials to continue browsing...</p>
        </div>

        {/* Fields */}
        <div className="cr-fields">
          <Field label="Username or Email" icon={<UserCircle size={14} />}>
            <input
              className="cr-input"
              type="text"
              placeholder="Enter your username or email"
              value={form.usernameOrEmail}
              onChange={update("usernameOrEmail")}
              autoFocus
              autoComplete="username"
            />
          </Field>

          <Field label="Password" icon={<Lock size={14} />}>
            <div className="cr-input-wrap">
              <input
                className="cr-input cr-input--icon-right"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={update("password")}
                autoComplete="current-password"
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
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        {/* Register link */}
        <p className="cr-login-link">
          Don't have an account?{" "}
          <Link to="/register" className="cr-link">
            Register
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