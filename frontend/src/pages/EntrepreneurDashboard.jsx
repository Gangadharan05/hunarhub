import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function StatusPill({ status }) {
  return <span className={`hh-status hh-status-${status}`}>{status}</span>;
}

export default function EntrepreneurDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [profileForm, setProfileForm] = useState({
    business_name: '', bio: '', category_id: '', location: '', experience_years: 0,
    price_range_min: 0, price_range_max: 0, skills: '',
  });
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '' });

  function loadAll() {
    setLoading(true);
    api.get('/categories').then(setCategories).catch(() => setCategories([]));

    api.get('/entrepreneurs/me/profile', true)
      .then((p) => {
        setProfile(p);
        setProducts(p.products || []);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));

    api.get('/service-requests', true).then(setRequests).catch(() => setRequests([]));
    api.get('/orders', true).then(setOrders).catch(() => setOrders([]));
  }

  useEffect(loadAll, []);

  async function handleCreateProfile(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const payload = {
        ...profileForm,
        category_id: profileForm.category_id || null,
        skills: profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await api.post('/entrepreneurs', payload, true);
      setMessage({ type: 'success', text: 'Storefront created! You can now add products.' });
      loadAll();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await api.post('/products', {
        entrepreneur_id: profile.id,
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock) || 0,
      }, true);
      setMessage({ type: 'success', text: 'Product added.' });
      setProductForm({ name: '', description: '', price: '', stock: '' });
      loadAll();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function deleteProduct(id) {
    try {
      await api.del(`/products/${id}`, true);
      loadAll();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function updateRequestStatus(id, status) {
    try {
      await api.patch(`/service-requests/${id}/status`, { status }, true);
      loadAll();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function updateOrderStatus(id, status) {
    try {
      await api.patch(`/orders/${id}/status`, { status }, true);
      loadAll();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  if (loading) return <div className="container py-5"><p className="text-muted">Loading…</p></div>;

  return (
    <div className="container py-5">
      <h1 className="hh-section-title mb-1">Entrepreneur <span className="accent">dashboard</span></h1>
      <p className="text-muted mb-4">Manage your storefront, products, service requests, and orders.</p>

      {message && <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>{message.text}</div>}

      {!profile ? (
        <div className="hh-form-panel p-4">
          <h2 className="h5 display-font fw-semibold mb-3">Set up your storefront</h2>
          <form onSubmit={handleCreateProfile}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Business name</label>
              <input type="text" className="form-control" required value={profileForm.business_name} onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })} />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Category</label>
                <select className="form-select" value={profileForm.category_id} onChange={(e) => setProfileForm({ ...profileForm, category_id: e.target.value })}>
                  <option value="">Select a category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Location</label>
                <input type="text" className="form-control" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Bio</label>
              <textarea className="form-control" rows={3} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Skills (comma separated)</label>
              <input type="text" className="form-control" placeholder="e.g. Leather repair, Custom footwear" value={profileForm.skills} onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })} />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Years of experience</label>
                <input type="number" min="0" className="form-control" value={profileForm.experience_years} onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Price from (₹)</label>
                <input type="number" min="0" className="form-control" value={profileForm.price_range_min} onChange={(e) => setProfileForm({ ...profileForm, price_range_min: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Price to (₹)</label>
                <input type="number" min="0" className="form-control" value={profileForm.price_range_max} onChange={(e) => setProfileForm({ ...profileForm, price_range_max: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-hh-accent w-100">Create storefront</button>
          </form>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="hh-card p-4 mb-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="hh-eyebrow-mono">{profile.category_name || 'Uncategorised'}</span>
                {profile.is_verified ? <span className="hh-badge-verified">Verified</span> : <span className="hh-badge-pending">Pending admin review</span>}
              </div>
              <h2 className="h5 display-font fw-semibold mb-1">{profile.business_name}</h2>
              <p className="small text-muted mb-0">{profile.location}</p>
            </div>

            <h3 className="h6 display-font fw-semibold mb-3">Add a product</h3>
            <div className="hh-form-panel p-3 mb-4">
              <form onSubmit={handleAddProduct}>
                <div className="mb-2">
                  <input type="text" className="form-control form-control-sm" placeholder="Product name" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                </div>
                <div className="mb-2">
                  <textarea className="form-control form-control-sm" placeholder="Description" rows={2} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <input type="number" min="0" step="0.01" className="form-control form-control-sm" placeholder="Price ₹" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                  </div>
                  <div className="col-6">
                    <input type="number" min="0" className="form-control form-control-sm" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-hh-accent btn-sm w-100">Add product</button>
              </form>
            </div>

            <h3 className="h6 display-font fw-semibold mb-3">Your products</h3>
            {products.length === 0 ? <p className="small text-muted">No products yet.</p> : (
              <div className="d-flex flex-column gap-2">
                {products.map((p) => (
                  <div key={p.id} className="hh-card p-3 d-flex justify-content-between align-items-center">
                    <div>
                      <strong className="small">{p.name}</strong>
                      <p className="hh-price small mb-0">₹{Number(p.price).toFixed(0)} · {p.stock} in stock</p>
                    </div>
                    <button className="btn btn-hh-outline btn-sm" onClick={() => deleteProduct(p.id)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-lg-7">
            <h3 className="h6 display-font fw-semibold mb-3">Service requests</h3>
            {requests.length === 0 ? <p className="small text-muted mb-4">No service requests yet.</p> : (
              <div className="d-flex flex-column gap-2 mb-4">
                {requests.map((r) => (
                  <div key={r.id} className="hh-card p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong className="small">{r.customer_name}</strong>
                        <p className="small mb-1" style={{ color: 'var(--ink-600)' }}>{r.description}</p>
                      </div>
                      <StatusPill status={r.status} />
                    </div>
                    {r.status === 'pending' && (
                      <div className="d-flex gap-2 mt-2">
                        <button className="btn btn-hh-accent btn-sm" onClick={() => updateRequestStatus(r.id, 'accepted')}>Accept</button>
                        <button className="btn btn-hh-outline btn-sm" onClick={() => updateRequestStatus(r.id, 'rejected')}>Decline</button>
                      </div>
                    )}
                    {r.status === 'accepted' && (
                      <div className="d-flex gap-2 mt-2">
                        <button className="btn btn-hh-accent btn-sm" onClick={() => updateRequestStatus(r.id, 'completed')}>Mark completed</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <h3 className="h6 display-font fw-semibold mb-3">Orders</h3>
            {orders.length === 0 ? <p className="small text-muted">No orders yet.</p> : (
              <div className="d-flex flex-column gap-2">
                {orders.map((o) => (
                  <div key={o.id} className="hh-card p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong className="small">{o.product_name}</strong>
                        <p className="small mb-1" style={{ color: 'var(--ink-600)' }}>{o.customer_name} · qty {o.quantity} · <span className="hh-price">₹{Number(o.total_price).toFixed(0)}</span></p>
                      </div>
                      <StatusPill status={o.status} />
                    </div>
                    {o.status === 'pending' && (
                      <div className="d-flex gap-2 mt-2">
                        <button className="btn btn-hh-accent btn-sm" onClick={() => updateOrderStatus(o.id, 'confirmed')}>Confirm</button>
                      </div>
                    )}
                    {o.status === 'confirmed' && (
                      <div className="d-flex gap-2 mt-2">
                        <button className="btn btn-hh-accent btn-sm" onClick={() => updateOrderStatus(o.id, 'delivered')}>Mark delivered</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
