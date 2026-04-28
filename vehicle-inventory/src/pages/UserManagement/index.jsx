import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  ShieldCheck,
  ChevronDown,
  Search,
  RefreshCw,
} from "lucide-react";
import "./index.css";
import AddUserModal from "./AddUserModal";

//  Role config
const ROLES = ["Customer", "Admin", "Staff"];

const ROLE_STYLE = {
  Admin:    "um-badge um-badge--admin",
  Staff:    "um-badge um-badge--staff",
  Customer: "um-badge um-badge--customer",
};

//  API helpers 
const BASE = "http://localhost:5047/api";

async function fetchUsers() {
  const res = await fetch(`${BASE}/users`);
  if (!res.ok) throw new Error("Failed to fetch users.");
  return res.json();
}

async function deleteUser(id) {
  const res = await fetch(`${BASE}/users/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete user.");
}

async function updateRole(id, role) {
  const res = await fetch(`${BASE}/users/${id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Failed to update role.");
}

//  Component 
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [openRoleDropdown, setOpenRoleDropdown] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openRoleDropdown) return;
    const handler = () => setOpenRoleDropdown(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openRoleDropdown]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    setOpenRoleDropdown(null);
    setUpdatingRoleId(id);
    try {
      await updateRole(id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.userName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="um-page">
      {/* ── Page header ── */}
      <div className="um-page-header">
        <div className="um-page-title-group">
          <div>
            <h1 className="um-page-title">User Management</h1>
            <p className="um-page-subtitle">
              {users.length} registered user{users.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="um-header-actions">

            {/* Refresh */}
          <button
            className="um-btn um-btn--ghost"
            onClick={loadUsers}
            disabled={loading}
            title="Refresh"
            type="button"
          >
            <RefreshCw size={15} className={loading ? "um-spin" : ""} />
          </button>
          
          {/* Search */}
          <div className="um-search-wrap">
            <Search size={14} className="um-search-icon" />
            <input
              className="um-search"
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>


          {/* Add user */}
          <button
            className="um-btn um-btn--primary"
            onClick={() => setShowAddModal(true)}
            type="button"
          >
            <UserPlus size={15} />
            Add User
          </button>
        </div>
      </div>

      {/*  Error state  */}
      {error && (
        <div className="um-error-banner">{error}</div>
      )}

      {/*  Table card  */}
      <div className="um-card">
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Vehicle No.</th>
                <th className="um-th-center">Points</th>
                <th className="um-th-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="um-state-cell">
                    <span className="um-table-spinner" />
                    <span className="um-state-text">Loading users…</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="um-state-cell">
                    <Users size={32} className="um-empty-icon" />
                    <span className="um-state-text">
                      {search ? "No users match your search." : "No users found."}
                    </span>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="um-row">
                    <td className="um-username">{user.userName || "—"}</td>
                    <td>{user.firstName || "—"}</td>
                    <td>{user.lastName || "—"}</td>
                    <td className="um-email">{user.email || "—"}</td>
                    <td>{user.phoneNumber || "—"}</td>

                    {/* Role cell with dropdown */}
                    <td>
                      <div className="um-role-cell">
                        <span className={ROLE_STYLE[user.role] || "um-badge"}>
                          {user.role || "—"}
                        </span>
                        <div className="um-role-dropdown-wrap">
                          <button
                            className="um-role-btn"
                            type="button"
                            disabled={updatingRoleId === user.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenRoleDropdown((prev) =>
                                prev === user.id ? null : user.id
                              );
                            }}
                            title="Change role"
                          >
                            {updatingRoleId === user.id ? (
                              <span className="um-mini-spinner" />
                            ) : (
                              <ChevronDown size={13} />
                            )}
                          </button>

                          {openRoleDropdown === user.id && (
                            <div
                              className="um-dropdown"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {ROLES.filter((r) => r !== user.role).map((r) => (
                                <button
                                  key={r}
                                  className="um-dropdown-item"
                                  type="button"
                                  onClick={() => handleRoleChange(user.id, r)}
                                >
                                  <ShieldCheck size={13} />
                                  Set as {r}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>{user.vehicleNumber || "—"}</td>

                    <td className="um-td-center">
                      <span className="um-points">{user.points ?? 0}</span>
                    </td>

                    {/* Actions */}
                    <td className="um-td-center">
                      <button
                        className="um-action-btn um-action-btn--delete"
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        title="Delete user"
                      >
                        {deletingId === user.id ? (
                          <span className="um-mini-spinner um-mini-spinner--danger" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal  */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={loadUsers}
        />
      )}
    </div>
  );
}