import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import EntrepreneurCard from '../components/EntrepreneurCard.jsx';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (category) qs.set('category', category);
    if (location) qs.set('location', location);
    if (search) qs.set('search', search);
    api.get(`/entrepreneurs?${qs.toString()}`)
      .then(setEntrepreneurs)
      .catch(() => setEntrepreneurs([]))
      .finally(() => setLoading(false));
  }, [category, location, search]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  }

  return (
    <div className="container py-5">
      <h1 className="hh-section-title mb-2">Browse <span className="accent">micro-entrepreneurs</span></h1>
      <p className="text-muted mb-4">Filter by trade, location, or search for a name and see who's ready to take your request.</p>

      <div className="hh-form-panel p-3 p-md-4 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Business name or bio…"
              defaultValue={search}
              onBlur={(e) => updateParam('search', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Category</label>
            <select className="form-select" value={category} onChange={(e) => updateParam('category', e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Location</label>
            <input
              type="text"
              className="form-control"
              placeholder="City or area…"
              defaultValue={location}
              onBlur={(e) => updateParam('location', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateParam('location', e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading entrepreneurs…</p>
      ) : entrepreneurs.length === 0 ? (
        <div className="hh-card p-5 text-center">
          <p className="mb-0 text-muted">No entrepreneurs match those filters yet. Try widening your search.</p>
        </div>
      ) : (
        <div className="row g-4">
          {entrepreneurs.map((e) => (
            <div className="col-md-6 col-lg-4" key={e.id}>
              <EntrepreneurCard entrepreneur={e} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
