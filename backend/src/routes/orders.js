import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  if (req.user.role === 'customer') {
    const result = await query(
      `SELECT o.*, e.business_name, p.name AS product_name FROM orders o
       JOIN entrepreneurs e ON e.id = o.entrepreneur_id
       LEFT JOIN products p ON p.id = o.product_id
       WHERE o.customer_id = $1 ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  }
  if (req.user.role === 'entrepreneur') {
    const result = await query(
      `SELECT o.*, u.name AS customer_name, p.name AS product_name FROM orders o
       JOIN entrepreneurs e ON e.id = o.entrepreneur_id
       JOIN users u ON u.id = o.customer_id
       LEFT JOIN products p ON p.id = o.product_id
       WHERE e.user_id = $1 ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  }
  const result = await query(
    `SELECT o.*, e.business_name, u.name AS customer_name FROM orders o
     JOIN entrepreneurs e ON e.id = o.entrepreneur_id
     JOIN users u ON u.id = o.customer_id
     ORDER BY o.created_at DESC`
  );
  res.json(result.rows);
});

router.post('/', requireAuth, requireRole('customer'), async (req, res) => {
  const { product_id, quantity } = req.body;
  const qty = Number(quantity) || 1;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });

  const productRes = await query('SELECT * FROM products WHERE id = $1', [product_id]);
  const product = productRes.rows[0];
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.stock < qty) return res.status(400).json({ error: 'Not enough stock available' });

  const total = Number(product.price) * qty;
  const result = await query(
    `INSERT INTO orders (customer_id, entrepreneur_id, product_id, quantity, total_price)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.user.id, product.entrepreneur_id, product_id, qty, total]
  );
  await query('UPDATE products SET stock = stock - $1 WHERE id = $2', [qty, product_id]);
  res.status(201).json(result.rows[0]);
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const entrepreneurAllowed = ['confirmed', 'delivered'];
  const customerAllowed = ['cancelled'];

  if (req.user.role === 'entrepreneur' && entrepreneurAllowed.includes(status)) {
    const result = await query(
      `UPDATE orders o SET status = $1 FROM entrepreneurs e
       WHERE o.entrepreneur_id = e.id AND o.id = $2 AND e.user_id = $3 RETURNING o.*`,
      [status, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(403).json({ error: 'You can only update your own orders' });
    return res.json(result.rows[0]);
  }
  if (req.user.role === 'customer' && customerAllowed.includes(status)) {
    const result = await query(
      `UPDATE orders SET status = $1 WHERE id = $2 AND customer_id = $3 RETURNING *`,
      [status, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(403).json({ error: 'You can only cancel your own orders' });
    return res.json(result.rows[0]);
  }
  return res.status(403).json({ error: 'Not permitted to set this status' });
});

export default router;
