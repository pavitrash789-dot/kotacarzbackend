import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import type { DashboardData } from "../api/types";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (!data) return <div className="empty">Failed to load dashboard</div>;

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">KOTA CAZ RENTALS</span>
          <h1>Dashboard</h1>
        </div>
        <Link to="/agreements/new" className="btn btn-primary">
          ＋ New Agreement
        </Link>
      </header>

      <div className="cards">
        <div className="card">
          <span>Total Rentals</span>
          <strong>{data.totalAgreements}</strong>
        </div>
        <div className="card">
          <span>Vehicles Available</span>
          <strong>{data.availableVehicles}</strong>
        </div>
        <div className="card">
          <span>Vehicles Out</span>
          <strong>{data.outVehicles}</strong>
        </div>
        <div className="card">
          <span>Security Deposits</span>
          <strong>₹{Math.round(data.totalDeposits).toLocaleString()}</strong>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h2>Recent Rentals</h2>
          <Link to="/agreements" className="link">
            View all →
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Agreement</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Mobile</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.recentAgreements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty">
                    No agreements yet.
                  </td>
                </tr>
              ) : (
                data.recentAgreements.map((a) => (
                  <tr key={a._id}>
                    <td>{a.agreementNo}</td>
                    <td>
                      <b>{a.hireName}</b>
                    </td>
                    <td>
                      {a.carModel || "-"}
                      <small>{a.carReg}</small>
                    </td>
                    <td>{a.mobile}</td>
                    <td>{a.createdAt?.slice(0, 10)}</td>
                    <td>
                      <a
                        href={`/api/agreements/${a._id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                        download
                      >
                        PDF
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h2>Vehicles</h2>
          <Link to="/vehicles" className="link">
            Manage →
          </Link>
        </div>
        <div className="vehicle-grid">
          {data.recentVehicles.length === 0 ? (
            <div className="empty">Add your cars from Vehicles.</div>
          ) : (
            data.recentVehicles.map((v) => (
              <div className="vehicle" key={v._id}>
                <b>{v.modelName}</b>
                <span>{v.registration}</span>
                <small>
                  {v.vehicleType} · {v.fuelType}
                </small>
                <em className={v.status === "Available" ? "available" : "out"}>
                  {v.status}
                </em>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
