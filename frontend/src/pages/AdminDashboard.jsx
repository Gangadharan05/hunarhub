import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  function load() {
    setLoading(true);
    Promise.all([
      api.get('/admin/stats', true).catch(() => null),
      api.get('/admin/entrepreneurs', true).catch(() => []),
    ]).then(([s, e]) => {
      setStats(s);
      setEntrepreneurs(e);
    }).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function verify(id) {
    try {
      await api.patch(`/entrepreneurs/${id}/verify`, {}, true);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  if (loading) return <div className="container py-5"><p className="text-muted">Loading…</p></div>;

  return (
    <div className="container py-5">
      <h1 className="hh-section-title mb-1">Admin <span className="accent">console</span></h1>
      <p className="text-muted mb-4">Verify entrepreneurs and monitor platform activity.</p>

      {message && <div className="alert alert-danger">{message.text}</div>}

      {stats && (
        <div className="row g-3 mb-4">
          {[
            ['Registered entrepreneurs', stats.registeredEntrepreneurs],
            ['Active customers', stats.activeUsers],
            ['Total orders', stats.totalOrders],
            ['Product sales revenue', `₹${Number(stats.productSalesRevenue).toFixed(0)}`],
            ['Service requests', stats.totalServiceRequests],
            ['Avg. customer rating', `★ ${stats.avgCustomerRating}`],
          ].map(([label, value]) => (
            <div className="col-6 col-md-4 col-lg-2" key={label}>
              <div className="hh-card p-3 text-center h-100">
                <div className="hh-stat" style={{ color: 'var(--terracotta-600)' }}>{value}</div>
                <div className="small text-muted mt-1">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="h5 display-font fw-semibold mb-3">Entrepreneurs</h2>
      {entrepreneurs.length === 0 ? (
        <p className="text-muted">No entrepreneurs registered yet.</p>
      ) : (
        <div className="table-responsive hh-card">
          <table className="table table-borderless align-middle mb-0">
            <thead>
              <tr style={{ background: 'var(--paper-100)' }}>
                <th className="ps-3">Business</th>
                <th>Owner</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th className="pe-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {entrepreneurs.map((e) => (
                <tr key={e.id}>
                  <td className="ps-3">{e.business_name}</td>
                  <td className="small text-muted">{e.owner_name}<br />{e.email}</td>
                  <td>{e.category_name || '—'}</td>
                  <td>{e.location}</td>
                  <td>{e.is_verified ? <span className="hh-badge-verified">Verified</span> : <span className="hh-badge-pending">Pending</span>}</td>
                  <td className="pe-3">
                    {!e.is_verified && (
                      <button className="btn btn-hh-accent btn-sm" onClick={() => verify(e.id)}>Verify</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
