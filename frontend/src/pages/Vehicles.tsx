import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import client from "../api/client";
import type { Vehicle } from "../api/types";
import { useAuth } from "../contexts/AuthContext";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { hasPermission } = useAuth();

  const canCreate = hasPermission("vehicles_create");

  const [form, setForm] = useState({
    modelName: "",
    registration: "",
    vehicleType: "",
    fuelType: "Petrol",
    ratePerDay: "",
    status: "Available",
    notes: "",
  });

  const fetchVehicles = () => {
    setLoading(true);
    client
      .get("/vehicles")
      .then((res) => setVehicles(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await client.post("/vehicles", form);
      setForm({
        modelName: "",
        registration: "",
        vehicleType: "",
        fuelType: "Petrol",
        ratePerDay: "",
        status: "Available",
        notes: "",
      });
      setShowForm(false);
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add vehicle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      await client.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete vehicle");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await client.put(`/vehicles/${id}`, { status });
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update status");
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">MANAGEMENT</span>
          <h1>Vehicles</h1>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "＋ Add Vehicle"}
          </button>
        )}
      </header>

      {error && <div className="flash error">{error}</div>}

      {showForm && canCreate && (
        <div className="panel">
          <h2>Add Vehicle</h2>
          <form onSubmit={handleAdd}>
            <div className="form-grid three">
              <div className="form-group">
                <label>Model *</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Registration *</label>
                <input
                  type="text"
                  value={form.registration}
                  onChange={(e) =>
                    setForm({ ...form, registration: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Vehicle Type</label>
                <input
                  type="text"
                  value={form.vehicleType}
                  onChange={(e) =>
                    setForm({ ...form, vehicleType: e.target.value })
                  }
                  placeholder="SUV / Hatchback / Sedan"
                />
              </div>
              <div className="form-group">
                <label>Fuel Type</label>
                <select
                  value={form.fuelType}
                  onChange={(e) =>
                    setForm({ ...form, fuelType: e.target.value })
                  }
                >
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                  <option>CNG</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rate per Day (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.ratePerDay}
                  onChange={(e) =>
                    setForm({ ...form, ratePerDay: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  <option>Available</option>
                  <option>Out</option>
                  <option>Maintenance</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" type="submit">
              ＋ Add Vehicle
            </button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Registration</th>
                <th>Type</th>
                <th>Fuel</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="empty">
                    Loading...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    No vehicles added.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v._id}>
                    <td>
                      <b>{v.modelName}</b>
                    </td>
                    <td>{v.registration}</td>
                    <td>{v.vehicleType || "-"}</td>
                    <td>{v.fuelType}</td>
                    <td>
                      ₹{Math.round(v.ratePerDay || 0).toLocaleString()}
                    </td>
                    <td>
                      <select
                        value={v.status}
                        onChange={(e) => updateStatus(v._id, e.target.value)}
                        className={`status-select ${v.status === "Available" ? "status-available" : "status-out"}`}
                      >
                        <option>Available</option>
                        <option>Out</option>
                        <option>Maintenance</option>
                      </select>
                    </td>
                    <td>
                      {hasPermission("vehicles_delete") && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(v._id)}
                        >
                          Delete
                        </button>
                      )}
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
