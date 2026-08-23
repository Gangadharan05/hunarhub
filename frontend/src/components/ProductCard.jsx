import React from 'react';

export default function ProductCard({ product, onBuy, buying }) {
  const p = product;
  return (
    <div className="hh-card h-100 d-flex flex-column">
      <div className="p-3 d-flex flex-column flex-grow-1">
        <h4 className="h6 display-font fw-semibold mb-1">{p.name}</h4>
        <p className="small mb-2" style={{ color: 'var(--ink-600)' }}>{p.description}</p>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="hh-price">₹{Number(p.price).toFixed(0)}</span>
          <span className="small text-muted">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
        </div>
        {onBuy && (
          <button
            className="btn btn-hh-accent btn-sm w-100 mt-3"
            disabled={p.stock < 1 || buying}
            onClick={() => onBuy(p)}
          >
            {buying ? 'Placing order…' : p.stock < 1 ? 'Out of stock' : 'Buy now'}
          </button>
        )}
      </div>
    </div>
  );
}
