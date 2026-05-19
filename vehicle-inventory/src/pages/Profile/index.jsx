import { useState, useEffect, useCallback } from "react";
import {
  User,
  Car,
  Lock,
  Edit2,
  Save,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Star,
  CheckCircle,
} from "lucide-react";
import "./index.css";

//  API helpers 
const BASE = "http://localhost:5047/api";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  "Content-Type": "application/json",
});

async function fetchProfile() {
  const res = await fetch(`${BASE}/users/me`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch profile.");
  return res.json();
}

async function updateProfile(payload) {
  const res = await fetch(`${BASE}/users/me`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update profile.");
  return res.json();
}

async function changePassword(payload) {
  const res = await fetch(`${BASE}/users/me/password`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to change password.");
  }
}

//  Helpers 
function getInitials(firstName, lastName) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

//  Sub-components 

function SectionCard({ icon: Icon, title, action, children }) {
  return (
    <div className="pf-card">
      <div className="pf-card-header">
        <div className="pf-card-header-left">
          <span className="pf-card-icon">
            <Icon size={15} />
          </span>
          <h2 className="pf-card-title">{title}</h2>
        </div>
        {action && <div className="pf-card-header-action">{action}</div>}
      </div>
      <div className="pf-card-body">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="pf-field">
      <label className="pf-field-label">{label}</label>
      {children}
    </div>
  );
}

function ReadValue({ value }) {
  return <p className="pf-field-value">{value || "—"}</p>;
}

//  Main Component 
export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [editingVehicle, setEditingVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({});
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleSuccess, setVehicleSuccess] = useState(false);
  const [vehicleError, setVehicleError] = useState("");

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPw, setSavingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProfile();
      setProfile(data);
      setProfileForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
      });
      setVehicleForm({ vehicleNumber: data.vehicleNumber || "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setProfileError("");
    try {
      const updated = await updateProfile(profileForm);
      setProfile((prev) => ({ ...prev, ...updated }));
      setEditingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelProfileEdit = () => {
    setProfileForm({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      phoneNumber: profile.phoneNumber || "",
    });
    setProfileError("");
    setEditingProfile(false);
  };

  const handleVehicleSave = async () => {
    setSavingVehicle(true);
    setVehicleError("");
    try {
      const updated = await updateProfile(vehicleForm);
      setProfile((prev) => ({ ...prev, ...updated }));
      setEditingVehicle(false);
      setVehicleSuccess(true);
      setTimeout(() => setVehicleSuccess(false), 3000);
    } catch (err) {
      setVehicleError(err.message);
    } finally {
      setSavingVehicle(false);
    }
  };

  const cancelVehicleEdit = () => {
    setVehicleForm({ vehicleNumber: profile.vehicleNumber || "" });
    setVehicleError("");
    setEditingVehicle(false);
  };

  const handlePasswordSave = async () => {
    setPwError("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    setSavingPw(true);
    try {
      await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="pf-page">
        <div className="pf-loading-state">
          <span className="pf-table-spinner" />
          <span className="pf-state-text">Loading profile…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pf-page">
        <div className="pf-error-banner">{error}</div>
        <button className="pf-btn pf-btn--ghost" onClick={loadProfile}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  // ── Header-row action nodes ──
  const profileAction = editingProfile ? (
    <div className="pf-header-actions">
      <button
        className="pf-btn pf-btn--ghost pf-btn--sm"
        onClick={cancelProfileEdit}
        disabled={savingProfile}
        type="button"
      >
        <X size={13} /> Cancel
      </button>
      <button
        className="pf-btn pf-btn--primary pf-btn--sm"
        onClick={handleProfileSave}
        disabled={savingProfile}
        type="button"
      >
        {savingProfile ? <span className="pf-mini-spinner" /> : <Save size={13} />}
        Save
      </button>
    </div>
  ) : (
    <button
      className="pf-btn pf-btn--secondary pf-btn--sm"
      onClick={() => setEditingProfile(true)}
      type="button"
    >
      <Edit2 size={13} /> Edit Profile
    </button>
  );

  const vehicleAction = editingVehicle ? (
    <div className="pf-header-actions">
      <button
        className="pf-btn pf-btn--ghost pf-btn--sm"
        onClick={cancelVehicleEdit}
        disabled={savingVehicle}
        type="button"
      >
        <X size={13} /> Cancel
      </button>
      <button
        className="pf-btn pf-btn--primary pf-btn--sm"
        onClick={handleVehicleSave}
        disabled={savingVehicle}
        type="button"
      >
        {savingVehicle ? <span className="pf-mini-spinner" /> : <Save size={13} />}
        Save
      </button>
    </div>
  ) : (
    <button
      className="pf-btn pf-btn--secondary pf-btn--sm"
      onClick={() => setEditingVehicle(true)}
      type="button"
    >
      <Edit2 size={13} /> Edit Vehicle
    </button>
  );

  const passwordAction = (
    <button
      className="pf-btn pf-btn--primary pf-btn--sm"
      onClick={handlePasswordSave}
      disabled={savingPw}
      type="button"
    >
      {savingPw ? <span className="pf-mini-spinner" /> : <Lock size={13} />}
      Update Password
    </button>
  );

  return (
    <div className="pf-page">
      {/* ── Page header ── */}
      <div className="pf-page-header">
        <div>
          <h1 className="pf-page-title">My Profile</h1>
          <p className="pf-page-subtitle">
            Manage your account details and vehicle information
          </p>
        </div>
        <button
          className="pf-btn pf-btn--ghost"
          onClick={loadProfile}
          title="Refresh"
          type="button"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* ── Single-column stack of cards ── */}
      <div className="pf-main">

        {/* ── Personal Information (with avatar strip) ── */}
        <SectionCard icon={User} title="Personal Information" action={profileAction}>
          {profileSuccess && (
            <div className="pf-success-banner">
              <CheckCircle size={14} /> Profile updated successfully.
            </div>
          )}
          {profileError && <div className="pf-error-banner">{profileError}</div>}

          {/* Avatar + identity strip */}
          <div className="pf-identity-strip">
            <div className="pf-avatar">{getInitials(profile.firstName, profile.lastName)}</div>
            <div className="pf-identity-info">
              <p className="pf-avatar-name">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="pf-avatar-username">@{profile.userName || "—"}</p>
            </div>
            <span className="pf-role-badge">{profile.role || "Customer"}</span>
            <span className="pf-role-badge">{profile.points || 0} points</span>
          </div>

          <div className="pf-divider" />

          <div className="pf-grid-2">
            <Field label="First Name">
              {editingProfile ? (
                <input
                  className="pf-input"
                  value={profileForm.firstName}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                />
              ) : (
                <ReadValue value={profile.firstName} />
              )}
            </Field>

            <Field label="Last Name">
              {editingProfile ? (
                <input
                  className="pf-input"
                  value={profileForm.lastName}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                />
              ) : (
                <ReadValue value={profile.lastName} />
              )}
            </Field>

            <Field label="Email Address">
              {editingProfile ? (
                <input
                  className="pf-input"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              ) : (
                <ReadValue value={profile.email} />
              )}
            </Field>

            <Field label="Phone Number">
              {editingProfile ? (
                <input
                  className="pf-input"
                  type="tel"
                  value={profileForm.phoneNumber}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, phoneNumber: e.target.value }))
                  }
                />
              ) : (
                <ReadValue value={profile.phoneNumber} />
              )}
            </Field>
          </div>
        </SectionCard>

        {/* ── Vehicle Details ── */}
        <SectionCard icon={Car} title="Vehicle Details" action={vehicleAction}>
          {vehicleSuccess && (
            <div className="pf-success-banner">
              <CheckCircle size={14} /> Vehicle details updated.
            </div>
          )}
          {vehicleError && <div className="pf-error-banner">{vehicleError}</div>}

          <div className="pf-grid-1">
            <Field label="Vehicle Registration Number">
              {editingVehicle ? (
                <input
                  className="pf-input pf-input--mono"
                  placeholder="e.g. BA 1 PA 2345"
                  value={vehicleForm.vehicleNumber}
                  onChange={(e) =>
                    setVehicleForm({ vehicleNumber: e.target.value.toUpperCase() })
                  }
                />
              ) : (
                <p className="pf-field-value pf-field-value--mono">
                  {profile.vehicleNumber || "—"}
                </p>
              )}
            </Field>
          </div>
        </SectionCard>

        {/* ── Change Password ── */}
        <SectionCard icon={Lock} title="Change Password" action={passwordAction}>
          {pwSuccess && (
            <div className="pf-success-banner">
              <CheckCircle size={14} /> Password changed successfully.
            </div>
          )}
          {pwError && <div className="pf-error-banner">{pwError}</div>}

          <div className="pf-grid-3">
            {[
              { key: "current", label: "Current Password", field: "currentPassword" },
              { key: "new", label: "New Password", field: "newPassword" },
              { key: "confirm", label: "Confirm New Password", field: "confirmPassword" },
            ].map(({ key, label, field }) => (
              <Field key={key} label={label}>
                <div className="pf-pw-wrap">
                  <input
                    className="pf-input pf-input--pw"
                    type={showPw[key] ? "text" : "password"}
                    value={pwForm[field]}
                    onChange={(e) =>
                      setPwForm((p) => ({ ...p, [field]: e.target.value }))
                    }
                    autoComplete="new-password"
                  />
                  <button
                    className="pf-pw-toggle"
                    type="button"
                    onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                    tabIndex={-1}
                  >
                    {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
            ))}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}