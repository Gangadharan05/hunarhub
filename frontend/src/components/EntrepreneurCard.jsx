import React from 'react';
import { Link } from 'react-router-dom';

export default function EntrepreneurCard({ entrepreneur }) {
  const e = entrepreneur;
  return (
    <div className="hh-card h-100 d-flex flex-column">
      <div className="hh-card-header-strip" />
      <div className="p-4 d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="hh-eyebrow-mono">{e.category_name || 'Uncategorised'}</span>
          {e.is_verified ? (
            <span className="hh-badge-verified">Verified</span>
          ) : (
            <span className="hh-badge-pending">Pending review</span>
          )}
        </div>
        <h3 className="h5 display-font fw-semibold mb-1">{e.business_name}</h3>
        <p className="small text-muted mb-2">{e.location}</p>
        <p className="small mb-3" style={{ color: 'var(--ink-600)' }}>
          {e.bio ? (e.bio.length > 110 ? `${e.bio.slice(0, 110)}…` : e.bio) : 'No bio provided yet.'}
        </p>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {(e.skills || []).slice(0, 3).map((skill) => (
            <span key={skill} className="badge rounded-pill" style={{ background: 'var(--indigo-950)', color: 'var(--paper-100)', fontWeight: 500 }}>
              {skill}
            </span>
          ))}
        </div>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="hh-rating">★ {Number(e.avg_rating || 0).toFixed(1)} <span className="text-muted">({e.review_count || 0})</span></span>
          <Link to={`/entrepreneurs/${e.id}`} className="btn btn-hh-outline btn-sm px-3">View profile</Link>
        </div>
      </div>
    </div>
  );
}
