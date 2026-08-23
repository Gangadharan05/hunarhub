import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  if (req.user.role === 'customer') {
    const result = await query(
      `SELECT sr.*, e.business_name FROM service_requests sr
       JOIN entrepreneurs e ON e.id = sr.entrepreneur_id
       WHERE sr.customer_id = $1 ORDER BY sr.created_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  }
  if (req.user.role === 'entrepreneur') {
    const result = await query(
      `SELECT sr.*, u.name AS customer_name, u.phone AS customer_phone FROM service_requests sr
       JOIN entrepreneurs e ON e.id = sr.entrepreneur_id
       JOIN users u ON u.id = sr.customer_id
       WHERE e.user_id = $1 ORDER BY sr.created_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  }
  const result = await query(
    `SELECT sr.*, e.business_name, u.name AS customer_name FROM service_requests sr
     JOIN entrepreneurs e ON e.id = sr.entrepreneur_id
     JOIN users u ON u.id = sr.customer_id
     ORDER BY sr.created_at DESC`
  );
  res.json(result.rows);
});

router.post('/', requireAuth, requireRole('customer'), async (req, res) => {
  const { entrepreneur_id, description, requested_date } = req.body;
  if (!entrepreneur_id || !description) {
    return res.status(400).json({ error: 'entrepreneur_id and description are required' });
  }
  const result = await query(
    `INSERT INTO service_requests (customer_id, entrepreneur_id, description, requested_date)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.user.id, entrepreneur_id, description, requested_date || null]
  );
  res.status(201).json(result.rows[0]);
});

router.patch('/:id/status', requireAuth, requireRole('entrepreneur'), async (req, res) => {
  const { status } = req.body;
  const allowed = ['accepted', 'rejected', 'completed'];
  if (!allowed.includes(status)) return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });

  const sr = await query(
    `SELECT sr.* FROM service_requests sr JOIN entrepreneurs e ON e.id = sr.entrepreneur_id
     WHERE sr.id = $1 AND e.user_id = $2`,
    [req.params.id, req.user.id]
  );
  if (!sr.rows.length) return res.status(403).json({ error: 'You can only update your own service requests' });

  const result = await query('UPDATE service_requests SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  res.json(result.rows[0]);
});

router.patch('/:id/cancel', requireAuth, requireRole('customer'), async (req, res) => {
  const result = await query(
    `UPDATE service_requests SET status = 'cancelled' WHERE id = $1 AND customer_id = $2 RETURNING *`,
    [req.params.id, req.user.id]
  );
  if (!result.rows.length) return res.status(403).json({ error: 'You can only cancel your own request' });
  res.json(result.rows[0]);
});

export default router;
