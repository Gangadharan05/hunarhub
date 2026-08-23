import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const result = await query('SELECT * FROM categories ORDER BY name');
  res.json(result.rows);
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, slug, icon } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });
  const result = await query(
    'INSERT INTO categories (name, slug, icon) VALUES ($1, $2, $3) RETURNING *',
    [name, slug, icon || 'sparkle']
  );
  res.status(201).json(result.rows[0]);
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await query('DELETE FROM categories WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

export default router;
