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
  CheckCircle,
  ArrowLeft,
  Receipt,
  ShieldCheck,
  ChevronDown,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";
import "../Profile/index.css";

// API helpers 
const BASE = "http://localhost:5047/api";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  "Content-Type": "application/json",
});

async function fetchMe() {
  const res = await fetch(`${BASE}/users/me`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch current user.");
  return res.json();
}

async function fetchUserById(id) {
  const res = await fetch(`${BASE}/users/${id}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch user.");
  return res.json();
}

async function updateMyProfile(payload) {
  const res = await fetch(`${BASE}/users/me`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update profile.");
  return res.json();
}

async function updateUserById(id, payload) {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update user.");
  return res.json();
}

async function changeMyPassword(payload) {
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

async function fetchUserSales(userId) {
  const res = await fetch(`${BASE}/sales?customerId=${userId}`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error("Failed to fetch sales history.");
  return res.json();
}

async function updateUserRole(id, role) {
  const res = await fetch(`${BASE}/users/${id}/role`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Failed to update role.");
}

//  Helpers 
function getInitials(firstName, lastName) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function fmtPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price ?? 0);
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const ROLES = ["Customer", "Admin", "Staff"];

const ROLE_STYLE = {
  Admin: "pf-role-badge pf-role-badge--admin",
  Staff: "pf-role-badge pf-role-badge--staff",
  Customer: "pf-role-badge pf-role-badge--customer",
};

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

export default function UserDetailPage({ userId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [me, setMe] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Vehicle editing
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({});
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleSuccess, setVehicleSuccess] = useState(false);
  const [vehicleError, setVehicleError] = useState("");

  // Password (own profile only)
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPw, setSavingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Sales history (other user)
  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState("");
  const [expandedSaleId, setExpandedSaleId] = useState(null);

  // Role dropdown
  const [openRoleDropdown, setOpenRoleDropdown] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [meData, targetData] = await Promise.all([
        fetchMe(),
        fetchUserById(userId),
      ]);
      setMe(meData);
      setProfile(targetData);
      const own = String(meData.id) === String(userId);
      setIsOwnProfile(own);
      setProfileForm({
        firstName: targetData.firstName || "",
        lastName: targetData.lastName || "",
        email: targetData.email || "",
        phoneNumber: targetData.phoneNumber || "",
      });
      setVehicleForm({ vehicleNumber: targetData.vehicleNumber || "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load sales for non-own profiles
  const loadSales = useCallback(async () => {
    setSalesLoading(true);
    setSalesError("");
    try {
      const data = await fetchUserSales(userId);
      setSales(data);
    } catch (err) {
      setSalesError(err.message);
    } finally {
      setSalesLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!loading) {
        loadSales();
    }
    }, [isOwnProfile, loading, loadSales]);

  // Close role dropdown on outside click
  useEffect(() => {
    if (!openRoleDropdown) return;
    const handler = () => setOpenRoleDropdown(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openRoleDropdown]);

  //  Handlers 
  const handleProfileSave = async () => {
    setSavingProfile(true);
    setProfileError("");
    try {
      const updated = isOwnProfile
        ? await updateMyProfile(profileForm)
        : await updateUserById(userId, profileForm);
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
      const updated = isOwnProfile
        ? await updateMyProfile(vehicleForm)
        : await updateUserById(userId, vehicleForm);
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
      await changeMyPassword({
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

  const handleRoleChange = async (newRole) => {
    setOpenRoleDropdown(false);
    setUpdatingRole(true);
    try {
      await updateUserRole(userId, newRole);
      setProfile((prev) => ({ ...prev, role: newRole }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingRole(false);
    }
  };

  //  Loading / Error states 
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
        <button className="pf-btn pf-btn--ghost" onClick={loadData} type="button">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  //  Action nodes 
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

  //  Render 
  return (
    <div className="pf-page">
      {/* Page header */}
      <div className="pf-page-header">
        <div className="ud-header-left">
          <button
            className="pf-btn pf-btn--ghost"
            onClick={onBack}
            type="button"
            title="Back to User Management"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="pf-page-title">
              {isOwnProfile ? "My Profile" : `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.userName}
            </h1>
            <p className="pf-page-subtitle">
              {isOwnProfile
                ? "Manage your account details and vehicle information"
                : "View and manage this user's account"}
            </p>
          </div>
        </div>
        <button
          className="pf-btn pf-btn--ghost"
          onClick={loadData}
          title="Refresh"
          type="button"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="pf-main">

        {/*  Personal Information  */}
        <SectionCard icon={User} title="Personal Information" action={profileAction}>
          {profileSuccess && (
            <div className="pf-success-banner">
              <CheckCircle size={14} /> Profile updated successfully.
            </div>
          )}
          {profileError && <div className="pf-error-banner">{profileError}</div>}

          {/* Avatar + identity strip */}
          <div className="pf-identity-strip">
            <div className="pf-avatar">
              {getInitials(profile.firstName, profile.lastName)}
            </div>
            <div className="pf-identity-info">
              <p className="pf-avatar-name">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="pf-avatar-username">@{profile.userName || "—"}</p>
            </div>

            {/* Role badge with dropdown for non-own profiles */}
            {isOwnProfile ? (
              <>
                <span className={ROLE_STYLE[profile.role] || "pf-role-badge"}>
                  {profile.role || "Customer"}
                </span>
                <span className="pf-role-badge">{profile.points ?? 0} pts</span>
              </>
            ) : (
              <>
                <div className="ud-role-wrap">
                  <span className={ROLE_STYLE[profile.role] || "pf-role-badge"}>
                    {profile.role || "Customer"}
                  </span>
                  <button
                    className="ud-role-chevron"
                    type="button"
                    disabled={updatingRole}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenRoleDropdown((p) => !p);
                    }}
                    title="Change role"
                  >
                    {updatingRole ? (
                      <span className="pf-mini-spinner" />
                    ) : (
                      <ChevronDown size={13} />
                    )}
                  </button>
                  {openRoleDropdown && (
                    <div className="ud-dropdown" onClick={(e) => e.stopPropagation()}>
                      {ROLES.filter((r) => r !== profile.role).map((r) => (
                        <button
                          key={r}
                          className="ud-dropdown-item"
                          type="button"
                          onClick={() => handleRoleChange(r)}
                        >
                          <ShieldCheck size={13} />
                          Set as {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="pf-role-badge">{profile.points ?? 0} pts</span>
              </>
            )}
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

        {/* ── Change Password (own profile only) ── */}
        {isOwnProfile && (
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
        )}

        {/*  Sales History */}
          <SectionCard icon={Receipt} title="Sales History">
            {salesLoading && (
              <div className="pf-loading-state">
                <span className="pf-table-spinner" />
                <span className="pf-state-text">Loading sales…</span>
              </div>
            )}
            {salesError && <div className="pf-error-banner">{salesError}</div>}

            {!salesLoading && !salesError && sales.length === 0 && (
              <div className="ud-sales-empty">
                <Receipt size={32} className="ud-empty-icon" />
                <p className="pf-state-text">No sales records found for this user.</p>
              </div>
            )}

            {!salesLoading && sales.length > 0 && (
              <div className="ud-sales-list">
                {/* Summary stats row */}
                <div className="ud-sales-stats">
                  <div className="ud-stat">
                    <span className="ud-stat-label">Total Orders</span>
                    <span className="ud-stat-value">{sales.length}</span>
                  </div>
                  <div className="ud-stat">
                    <span className="ud-stat-label">Total Spent</span>
                    <span className="ud-stat-value">
                      {fmtPrice(sales.reduce((s, sale) => s + (sale.totalAmount ?? 0), 0))}
                    </span>
                  </div>
                  <div className="ud-stat">
                    <span className="ud-stat-label">Total Savings</span>
                    <span className="ud-stat-value ud-stat-value--green">
                      {fmtPrice(sales.reduce((s, sale) => s + (sale.discountAmount ?? 0), 0))}
                    </span>
                  </div>
                </div>

                <div className="pf-divider" />

                {/* Sale rows */}
                {sales.map((sale) => {
                  const isExpanded = expandedSaleId === sale.id;
                  return (
                    <div key={sale.id} className="ud-sale-row">
                      <button
                        className="ud-sale-header"
                        type="button"
                        onClick={() =>
                          setExpandedSaleId((prev) => (prev === sale.id ? null : sale.id))
                        }
                      >
                        <div className="ud-sale-header-left">
                          <span className="ud-sale-id">#{sale.id}</span>
                          <span className="ud-sale-date">
                            <Calendar size={12} />
                            {fmtDate(sale.saleDate)}
                          </span>
                          {sale.loyaltyDiscountApplied && (
                            <span className="ud-loyalty-badge">Loyalty Discount</span>
                          )}
                          <span className={`ud-paid-badge${sale.isPaid ? " ud-paid-badge--paid" : " ud-paid-badge--unpaid"}`}>
                            {sale.isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                        <div className="ud-sale-header-right">
                          <span className="ud-sale-total">{fmtPrice(sale.totalAmount)}</span>
                          <ChevronDown
                            size={14}
                            className={`ud-chevron${isExpanded ? " ud-chevron--open" : ""}`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="ud-sale-detail">
                          {/* Price breakdown */}
                          <div className="ud-price-breakdown">
                            <div className="ud-price-row">
                              <span>Subtotal</span>
                              <span>{fmtPrice(sale.subTotal)}</span>
                            </div>
                            {sale.discountAmount > 0 && (
                              <div className="ud-price-row ud-price-row--discount">
                                <span>Discount</span>
                                <span>−{fmtPrice(sale.discountAmount)}</span>
                              </div>
                            )}
                            <div className="ud-price-row ud-price-row--total">
                              <span>Total</span>
                              <span>{fmtPrice(sale.totalAmount)}</span>
                            </div>
                          </div>

                          {/* Sale items */}
                          {sale.saleItems && sale.saleItems.length > 0 && (
                            <div className="ud-items-list">
                              <p className="ud-items-label">Items</p>
                              {sale.saleItems.map((item) => (
                                <div key={item.id} className="ud-item-row">
                                  <Package size={12} className="ud-item-icon" />
                                  <span className="ud-item-name">
                                    {item.partName || `Part #${item.partId}`}
                                  </span>
                                  <span className="ud-item-qty">×{item.quantity}</span>
                                  <span className="ud-item-price">
                                    {fmtPrice(item.unitPrice * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
      </div>


      <style>{`
        .ud-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Role dropdown in identity strip */
        .ud-role-wrap {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ud-role-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
          color: var(--text-muted, #94a3b8);
          transition: background 0.15s;
        }
        .ud-role-chevron:hover {
          background: var(--bg-hover, #f1f5f9);
        }
        .ud-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          z-index: 50;
          background: var(--bg-card, #fff);
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          overflow: hidden;
          min-width: 140px;
        }
        .ud-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 9px 14px;
          font-size: 13px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-primary, #1e293b);
          transition: background 0.12s;
          text-align: left;
        }
        .ud-dropdown-item:hover {
          background: var(--bg-hover, #f8fafc);
        }

        /* Role badge variants */
        .pf-role-badge--admin {
          background: #fef3c7;
          color: #92400e;
        }
        .pf-role-badge--staff {
          background: #dbeafe;
          color: #1e40af;
        }
        .pf-role-badge--customer {
          background: #f0fdf4;
          color: #166534;
        }

        /* Sales */
        .ud-sales-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 32px 0;
          color: var(--text-muted, #94a3b8);
        }
        .ud-empty-icon {
          opacity: 0.4;
        }
        .ud-sales-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .ud-sales-stats {
          display: flex;
          gap: 32px;
          padding: 4px 0 16px;
          flex-wrap: wrap;
        }
        .ud-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ud-stat-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #94a3b8);
          font-weight: 600;
        }
        .ud-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
        }
        .ud-stat-value--green {
          color: #16a34a;
        }

        /* Sale accordion row */
        .ud-sale-row {
          border-top: 1px solid var(--border, #e2e8f0);
        }
        .ud-sale-row:last-child {
          border-bottom: 1px solid var(--border, #e2e8f0);
        }
        .ud-sale-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 14px 0;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          gap: 12px;
        }
        .ud-sale-header:hover {
          opacity: 0.8;
        }
        .ud-sale-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ud-sale-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .ud-sale-id {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary, #1e293b);
          font-family: monospace;
        }
        .ud-sale-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted, #94a3b8);
        }
        .ud-sale-total {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
        }
        .ud-loyalty-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 99px;
          background: #fef9c3;
          color: #854d0e;
          font-weight: 600;
        }
        .ud-paid-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 99px;
          font-weight: 600;
        }
        .ud-paid-badge--paid {
          background: #dcfce7;
          color: #166534;
        }
        .ud-paid-badge--unpaid {
          background: #fee2e2;
          color: #991b1b;
        }
        .ud-chevron {
          transition: transform 0.2s;
          color: var(--text-muted, #94a3b8);
        }
        .ud-chevron--open {
          transform: rotate(180deg);
        }

        /* Sale detail expanded panel */
        .ud-sale-detail {
          padding: 0 0 16px 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ud-price-breakdown {
          background: var(--bg-subtle, #f8fafc);
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ud-price-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-secondary, #475569);
        }
        .ud-price-row--discount {
          color: #16a34a;
        }
        .ud-price-row--total {
          font-weight: 700;
          color: var(--text-primary, #1e293b);
          border-top: 1px solid var(--border, #e2e8f0);
          padding-top: 6px;
          margin-top: 2px;
        }
        .ud-items-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #94a3b8);
          margin-bottom: 6px;
        }
        .ud-items-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ud-item-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border-radius: 8px;
          background: var(--bg-subtle, #f8fafc);
          font-size: 13px;
        }
        .ud-item-icon {
          color: var(--text-muted, #94a3b8);
          flex-shrink: 0;
        }
        .ud-item-name {
          flex: 1;
          color: var(--text-primary, #1e293b);
          font-weight: 500;
        }
        .ud-item-qty {
          color: var(--text-muted, #94a3b8);
          font-size: 12px;
        }
        .ud-item-price {
          font-weight: 600;
          color: var(--text-primary, #1e293b);
        }
      `}</style>
    </div>
  );
}