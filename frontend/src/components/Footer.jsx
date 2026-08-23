import React from 'react';
import { Link } from 'react-router-dom';
import ThreadDivider from './ThreadDivider.jsx';

export default function Footer() {
  return (
    <footer className="hh-footer pt-5 pb-4 mt-5">
      <div className="container">
        <ThreadDivider variant="dark" />
        <div className="row mt-4 gy-4">
          <div className="col-md-4">
            <div className="brand-mark mb-2" style={{ fontSize: '1.3rem' }}>Hunar<span style={{ color: 'var(--turmeric-500)' }}>Hub</span></div>
            <p className="small mb-0">A digital marketplace connecting local cobblers, potters, tailors, artisans, and vendors with the customers who need them.</p>
          </div>
          <div className="col-md-4">
            <h6 className="text-uppercase small fw-semibold mb-3" style={{ letterSpacing: '0.08em', color: 'var(--turmeric-400)' }}>Explore</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/browse">Browse entrepreneurs</Link></li>
              <li><Link to="/register">Join as an entrepreneur</Link></li>
              <li><Link to="/login">Sign in</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="text-uppercase small fw-semibold mb-3" style={{ letterSpacing: '0.08em', color: 'var(--turmeric-400)' }}>Categories</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li>Cobbler</li>
              <li>Potter (Kumhar)</li>
              <li>Tailor</li>
              <li>Artisan &amp; Small Vendor</li>
            </ul>
          </div>
        </div>
        <div className="small mt-4 pt-3 border-top" style={{ borderColor: 'var(--line-on-dark)', opacity: 0.7 }}>
          &copy; {new Date().getFullYear()} HunarHub. Built to help traditional skills find new customers.
        </div>
      </div>
    </footer>
  );
}
