import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';

function StatusPill({ status }) {
  return <span className={`hh-status hh-status-${status}`}>{status}</span>;
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState(null);

  function load() {
    setLoading(true);
    Promise.all([
      api.get('/orders', true).catch(() => []),
      api.get('/service-requests', true).catch(() => []),
    ]).then(([o, r]) => {
      setOrders(o);
      setRequests(r);
    }).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function cancelOrder(id) {
    try {
      await api.patch(`/orders/${id}/status`, { status: 'cancelled' }, true);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function cancelRequest(id) {
    try {
      await api.patch(`/service-requests/${id}/cancel`, {}, true);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        entrepreneur_id: reviewTarget.entrepreneur_id,
        order_id: reviewTarget.kind === 'order' ? reviewTarget.id : null,
        service_request_id: reviewTarget.kind === 'request' ? reviewTarget.id : null,
        rating,
        comment,
      }, true);
      setMessage({ type: 'success', text: 'Thanks — your review has been posted.' });
      setReviewTarget(null);
      setComment('');
      setRating(5);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="container py-5">
      <h1 className="hh-section-title mb-1">Your <span className="accent">dashboard</span></h1>
      <p className="text-muted mb-4">Track orders and service requests, and leave a review once work is done.</p>

      {message && <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>{message.text}</div>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="row g-4">
          <div className="col-lg-6">
            <h2 className="h5 display-font fw-semibold mb-3">Product orders</h2>
            {orders.length === 0 ? (
              <p className="text-muted small">No orders yet — browse entrepreneurs to buy something handmade.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {orders.map((o) => (
                  <div className="hh-card p-3" key={o.id}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{o.product_name}</strong>
                        <p className="small text-muted mb-1">from {o.business_name} · qty {o.quantity}</p>
                        <p className="hh-price small mb-0">₹{Number(o.total_price).toFixed(0)}</p>
                      </div>
                      <StatusPill status={o.status} />
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      {o.status === 'pending' && (
                        <button className="btn btn-hh-outline btn-sm" onClick={() => cancelOrder(o.id)}>Cancel</button>
                      )}
                      {o.status === 'delivered' && (
                        <button className="btn btn-hh-accent btn-sm" onClick={() => setReviewTarget({ id: o.id, entrepreneur_id: o.entrepreneur_id, kind: 'order' })}>
                          Leave a review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-lg-6">
            <h2 className="h5 display-font fw-semibold mb-3">Service requests</h2>
            {requests.length === 0 ? (
              <p className="text-muted small">No service requests yet — find an entrepreneur and ask for a service.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {requests.map((r) => (
                  <div className="hh-card p-3" key={r.id}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{r.business_name}</strong>
                        <p className="small mb-1" style={{ color: 'var(--ink-600)' }}>{r.description}</p>
                        {r.requested_date && <p className="small text-muted mb-0">Requested for {new Date(r.requested_date).toLocaleDateString()}</p>}
                      </div>
                      <StatusPill status={r.status} />
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      {r.status === 'pending' && (
                        <button className="btn btn-hh-outline btn-sm" onClick={() => cancelRequest(r.id)}>Cancel</button>
                      )}
                      {r.status === 'completed' && (
                        <button className="btn btn-hh-accent btn-sm" onClick={() => setReviewTarget({ id: r.id, entrepreneur_id: r.entrepreneur_id, kind: 'request' })}>
                          Leave a review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {reviewTarget && (
        <div className="hh-form-panel p-4 mt-4">
          <h2 className="h5 display-font fw-semibold mb-3">Rate your experience</h2>
          <form onSubmit={submitReview}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Rating</label>
              <select className="form-select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Comment (optional)</label>
              <textarea className="form-control" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-hh-accent">Submit review</button>
              <button type="button" className="btn btn-hh-outline" onClick={() => setReviewTarget(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
