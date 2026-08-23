import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ThreadDivider from '../components/ThreadDivider.jsx';

export default function EntrepreneurProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [requestDesc, setRequestDesc] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [message, setMessage] = useState(null);

  function load() {
    setLoading(true);
    api.get(`/entrepreneurs/${id}`).then(setProfile).catch(() => setProfile(null)).finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleBuy(product) {
    setMessage(null);
    if (!user) return setMessage({ type: 'error', text: 'Please log in as a customer to place an order.' });
    if (user.role !== 'customer') return setMessage({ type: 'error', text: 'Only customer accounts can place orders.' });
    setBuyingId(product.id);
    try {
      await api.post('/orders', { product_id: product.id, quantity: 1 }, true);
      setMessage({ type: 'success', text: `Order placed for ${product.name}. Check your dashboard for status.` });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBuyingId(null);
    }
  }

  async function handleServiceRequest(e) {
    e.preventDefault();
    setMessage(null);
    if (!user) return setMessage({ type: 'error', text: 'Please log in as a customer to send a request.' });
    if (user.role !== 'customer') return setMessage({ type: 'error', text: 'Only customer accounts can send service requests.' });
    try {
      await api.post('/service-requests', {
        entrepreneur_id: Number(id),
        description: requestDesc,
        requested_date: requestDate || null,
      }, true);
      setMessage({ type: 'success', text: 'Service request sent. The entrepreneur will confirm from their dashboard.' });
      setRequestDesc('');
      setRequestDate('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  if (loading) return <div className="container py-5"><p className="text-muted">Loading profile…</p></div>;
  if (!profile) return <div className="container py-5"><p className="text-muted">Entrepreneur not found.</p></div>;

  return (
    <div className="container py-5">
      <div className="hh-card p-4 p-md-5 mb-4">
        <div className="d-flex justify-content-between flex-wrap gap-3 mb-2">
          <span className="hh-eyebrow-mono">{profile.category_name || 'Uncategorised'}</span>
          {profile.is_verified ? <span className="hh-badge-verified">Verified</span> : <span className="hh-badge-pending">Pending review</span>}
        </div>
        <h1 className="display-font fw-semibold mb-1">{profile.business_name}</h1>
        <p className="text-muted mb-3">{profile.location} · {profile.experience_years} yrs experience · ★ {Number(profile.avg_rating || 0).toFixed(1)} ({profile.review_count} reviews)</p>
        <p className="mb-3">{profile.bio}</p>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {(profile.skills || []).map((s) => (
            <span key={s} className="badge rounded-pill" style={{ background: 'var(--indigo-950)', color: 'var(--paper-100)', fontWeight: 500 }}>{s}</span>
          ))}
        </div>
        <p className="small text-muted mb-0 font-mono">Typical range: ₹{profile.price_range_min} – ₹{profile.price_range_max}</p>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>{message.text}</div>
      )}

      <div className="row g-4">
        <div className="col-lg-7">
          <h2 className="h4 display-font fw-semibold mb-3">Products</h2>
          {profile.products.length === 0 ? (
            <p className="text-muted">No products listed yet.</p>
          ) : (
            <div className="row g-3">
              {profile.products.map((p) => (
                <div className="col-sm-6" key={p.id}>
                  <ProductCard product={p} onBuy={handleBuy} buying={buyingId === p.id} />
                </div>
              ))}
            </div>
          )}

          <ThreadDivider />

          <h2 className="h4 display-font fw-semibold mb-3 mt-4">Reviews</h2>
          {profile.reviews.length === 0 ? (
            <p className="text-muted">No reviews yet.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {profile.reviews.map((r) => (
                <div className="hh-card p-3" key={r.id}>
                  <div className="d-flex justify-content-between">
                    <strong>{r.customer_name}</strong>
                    <span className="hh-rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p className="small mb-0 mt-1" style={{ color: 'var(--ink-600)' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-5">
          <div className="hh-form-panel p-4">
            <h2 className="h5 display-font fw-semibold mb-3">Send a service request</h2>
            <form onSubmit={handleServiceRequest}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">What do you need?</label>
                <textarea
                  className="form-control"
                  rows={4}
                  required
                  value={requestDesc}
                  onChange={(e) => setRequestDesc(e.target.value)}
                  placeholder="Describe the service you'd like…"
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Preferred date (optional)</label>
                <input type="date" className="form-control" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-hh-accent w-100">Send request</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
