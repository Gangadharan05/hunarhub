import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <p className="hh-eyebrow-mono mb-2">404</p>
      <h1 className="hh-section-title mb-3">This street doesn't exist</h1>
      <p className="text-muted mb-4">The page you're looking for isn't here. Let's get you back on track.</p>
      <Link to="/" className="btn btn-hh-accent">Back to home</Link>
    </div>
  );
}
