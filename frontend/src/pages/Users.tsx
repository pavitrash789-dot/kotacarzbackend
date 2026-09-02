import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import client from "../api/client";
import type { User } from "../api/types";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "staff" as "admin" | "staff",
  });

  const fetchUsers = () => {
    setLoading(true);
    client
      .get("/auth/users")
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await client.post("/auth/register", form);
      setForm({ username: "", password: "", fullName: "", role: "staff" });
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create user");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await client.delete(`/auth/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete user");
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await client.put(`/auth/users/${id}`, { role });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update user");
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Users</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "＋ New User"}
        </button>
      </header>

      {error && <div className="flash error">{error}</div>}

      {showForm && (
        <div className="panel">
          <h2>Create User</h2>
          <form onSubmit={handleCreate}>
            <div className="form-grid two">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as "admin" | "staff" })
                  }
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit">
              Create User
            </button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="empty">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <b>{u.fullName}</b>
                    </td>
                    <td>{u.username}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    </td>
                    <td>
                      <div className="permission-tags">
                        {u.permissions?.slice(0, 4).map((p) => (
                          <span key={p} className="perm-tag">
                            {p}
                          </span>
                        ))}
                        {(u.permissions?.length || 0) > 4 && (
                          <span className="perm-tag">
                            +{(u.permissions?.length || 0) - 4} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
