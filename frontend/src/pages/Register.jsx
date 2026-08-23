import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '', location: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await register(form);
      navigate(user.role === 'entrepreneur' ? '/entrepreneur-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <h1 className="hh-section-title mb-1">Join <span className="accent">HunarHub</span></h1>
      <p className="text-muted mb-4">Sign up as a customer to book services and buy handmade goods, or as an entrepreneur to list your skill.</p>
      <div className="hh-form-panel p-4">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">I am joining as a…</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input className="form-check-input" type="radio" name="role" id="roleCustomer" checked={form.role === 'customer'} onChange={() => update('role', 'customer')} />
                <label className="form-check-label" htmlFor="roleCustomer">Customer</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="role" id="roleEntrepreneur" checked={form.role === 'entrepreneur'} onChange={() => update('role', 'entrepreneur')} />
                <label className="form-check-label" htmlFor="roleEntrepreneur">Micro-entrepreneur</label>
              </div>
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Full name</label>
              <input type="text" className="form-control" required value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Phone</label>
              <input type="tel" className="form-control" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email</label>
            <input type="email" className="form-control" required value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Password</label>
              <input type="password" className="form-control" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Location</label>
              <input type="text" className="form-control" placeholder="City" value={form.location} onChange={(e) => update('location', e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-hh-accent w-100" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="small text-muted mt-3 mb-0">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        {form.role === 'entrepreneur' && (
          <p className="small text-muted mt-2 mb-0">
            After signing up, complete your storefront (category, bio, skills, products) from your dashboard.
          </p>
        )}
      </div>
    </div>
  );
}
