import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import ThreadDivider from '../components/ThreadDivider.jsx';
import EntrepreneurCard from '../components/EntrepreneurCard.jsx';

const CATEGORY_ICONS = {
  cobbler: '👞',
  potter: '🏺',
  tailor: '🧵',
  artisan: '🎨',
  vendor: '🧺',
};

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => setCategories([]));
    api.get('/entrepreneurs').then((rows) => setFeatured(rows.slice(0, 3))).catch(() => setFeatured([]));
  }, []);

  return (
    <div>
      <section className="hh-hero py-5">
        <div className="container py-5">
          <div className="row align-items-center gy-5">
            <div className="col-lg-7">
              <div className="eyebrow mb-3">A marketplace stitched together, trade by trade</div>
              <h1 className="mb-4">
                Every cobbler, potter, and tailor <em>deserves</em> customers beyond their street.
              </h1>
              <p className="lead mb-4">
                HunarHub gives local micro-entrepreneurs a storefront, a booking desk, and a reputation —
                so skill finds demand, not the other way around.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/browse" className="btn btn-hh-accent btn-lg px-4">Find an entrepreneur</Link>
                <Link to="/register" className="btn btn-outline-light btn-lg px-4" style={{ borderRadius: 8 }}>List your skill</Link>
              </div>
              <div className="row mt-5 gx-4">
                <div className="col-4">
                  <div className="hh-stat">5</div>
                  <div className="hh-stat-label">Trade categories</div>
                </div>
                <div className="col-4">
                  <div className="hh-stat">0%</div>
                  <div className="hh-stat-label">Middleman cut</div>
                </div>
                <div className="col-4">
                  <div className="hh-stat">&lt;3s</div>
                  <div className="hh-stat-label">Page load target</div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="p-4 rounded-4" style={{ background: 'rgba(244,236,219,0.06)', border: '1px solid var(--line-on-dark)' }}>
                <p className="font-mono small mb-3" style={{ color: 'var(--turmeric-400)' }}>// how it works</p>
                <ol className="list-unstyled d-flex flex-column gap-3 mb-0">
                  <li className="d-flex gap-3"><span className="font-mono" style={{ color: 'var(--turmeric-500)' }}>01</span><span>Browse entrepreneurs by trade, location, or price</span></li>
                  <li className="d-flex gap-3"><span className="font-mono" style={{ color: 'var(--turmeric-500)' }}>02</span><span>Place a service request or buy a handmade product</span></li>
                  <li className="d-flex gap-3"><span className="font-mono" style={{ color: 'var(--turmeric-500)' }}>03</span><span>Entrepreneur confirms, delivers, you leave a rating</span></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <h2 className="hh-section-title mb-4">Browse by <span className="accent">trade</span></h2>
          <div className="row g-3">
            {categories.map((c) => (
              <div className="col-6 col-md-4 col-lg-2" key={c.id}>
                <Link to={`/browse?category=${c.slug}`} className="hh-category-tile">
                  <span className="icon">{CATEGORY_ICONS[c.slug] || '✦'}</span>
                  <span className="name">{c.name}</span>
                </Link>
              </div>
            ))}
            <div className="col-6 col-md-4 col-lg-2">
              <Link to="/browse" className="hh-category-tile">
                <span className="icon">→</span>
                <span className="name">View all</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container"><ThreadDivider /></div>

      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <h2 className="hh-section-title mb-0">Recently <span className="accent">verified</span></h2>
            <Link to="/browse" className="btn btn-hh-outline btn-sm">See everyone</Link>
          </div>
          {featured.length === 0 ? (
            <p className="text-muted">No entrepreneurs yet — be the first to list your skill.</p>
          ) : (
            <div className="row g-4">
              {featured.map((e) => (
                <div className="col-md-6 col-lg-4" key={e.id}>
                  <EntrepreneurCard entrepreneur={e} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-5" style={{ background: 'var(--paper-100)' }}>
        <div className="container">
          <div className="row gy-4">
            <div className="col-md-4">
              <h3 className="h5 display-font fw-semibold mb-2">No digital presence, solved</h3>
              <p className="small" style={{ color: 'var(--ink-600)' }}>A free profile with photos, pricing, and reviews — visible far beyond foot traffic.</p>
            </div>
            <div className="col-md-4">
              <h3 className="h5 display-font fw-semibold mb-2">Bookings without the back-and-forth</h3>
              <p className="small" style={{ color: 'var(--ink-600)' }}>Customers request a service or order a product directly; entrepreneurs accept from one dashboard.</p>
            </div>
            <div className="col-md-4">
              <h3 className="h5 display-font fw-semibold mb-2">Trust, built in public</h3>
              <p className="small" style={{ color: 'var(--ink-600)' }}>Admin-verified profiles and honest ratings replace word-of-mouth guesswork.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
