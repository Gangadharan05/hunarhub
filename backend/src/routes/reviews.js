import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const { entrepreneurId } = req.query;
  if (!entrepreneurId) return res.status(400).json({ error: 'entrepreneurId query param is required' });
  const result = await query(
    `SELECT r.*, u.name AS customer_name FROM reviews r
     JOIN users u ON u.id = r.customer_id
     WHERE r.entrepreneur_id = $1 ORDER BY r.created_at DESC`,
    [entrepreneurId]
  );
  res.json(result.rows);
});

router.post('/', requireAuth, requireRole('customer'), async (req, res) => {
  const { entrepreneur_id, order_id, service_request_id, rating, comment } = req.body;
  if (!entrepreneur_id || !rating) return res.status(400).json({ error: 'entrepreneur_id and rating are required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be between 1 and 5' });

  const result = await query(
    `INSERT INTO reviews (customer_id, entrepreneur_id, order_id, service_request_id, rating, comment)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, entrepreneur_id, order_id || null, service_request_id || null, rating, comment || null]
  );
  res.status(201).json(result.rows[0]);
});

export default router;
