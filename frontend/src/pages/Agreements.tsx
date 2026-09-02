import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import type { Agreement } from "../api/types";

export default function Agreements() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: any = { page, limit: 20 };
    if (query) params.q = query;
    if (paymentFilter) params.paymentStatus = paymentFilter;

    client
      .get("/agreements", { params })
      .then((res) => {
        setAgreements(res.data.agreements);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, query, paymentFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput);
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">MANAGEMENT</span>
          <h1>Agreements</h1>
        </div>
        <Link to="/agreements/new" className="btn btn-primary">
          ＋ New Agreement
        </Link>
      </header>

      <div className="panel">
        <div className="search-bar">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, mobile, registration, or agreement no..."
              className="search-input"
            />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>
          <div className="filter-group">
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Payment Status</option>
              <option value="Paid">Paid</option>
              <option value="Part Paid">Part Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Agreement</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Rental</th>
                <th>Deposit</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="empty">
                    Loading...
                  </td>
                </tr>
              ) : agreements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    No matching agreements.
                  </td>
                </tr>
              ) : (
                agreements.map((a) => (
                  <tr key={a._id}>
                    <td>{a.agreementNo}</td>
                    <td>
                      <b>{a.hireName}</b>
                      <small>{a.mobile}</small>
                    </td>
                    <td>
                      {a.carModel || "-"}
                      <small>{a.carReg}</small>
                    </td>
                    <td>₹{Math.round(a.rentalAmount || 0).toLocaleString()}</td>
                    <td>
                      ₹{Math.round(a.securityDeposit || 0).toLocaleString()}
                    </td>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages} ({total} total)
            </span>
            <button
              className="btn btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
