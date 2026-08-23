import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

async function ownsEntrepreneurProfile(userId, entrepreneurId) {
  const r = await query('SELECT id FROM entrepreneurs WHERE id = $1 AND user_id = $2', [entrepreneurId, userId]);
  return r.rows.length > 0;
}

router.get('/', async (req, res) => {
  const { entrepreneurId } = req.query;
  if (entrepreneurId) {
    const result = await query('SELECT * FROM products WHERE entrepreneur_id = $1 ORDER BY created_at DESC', [entrepreneurId]);
    return res.json(result.rows);
  }
  const result = await query('SELECT * FROM products ORDER BY created_at DESC LIMIT 100');
  res.json(result.rows);
});

router.post('/', requireAuth, requireRole('entrepreneur'), async (req, res) => {
  const { entrepreneur_id, name, description, price, image_url, stock } = req.body;
  if (!entrepreneur_id || !name || price == null) {
    return res.status(400).json({ error: 'entrepreneur_id, name, and price are required' });
  }
  if (!(await ownsEntrepreneurProfile(req.user.id, entrepreneur_id))) {
    return res.status(403).json({ error: 'You can only add products to your own profile' });
  }
  const result = await query(
    `INSERT INTO products (entrepreneur_id, name, description, price, image_url, stock)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [entrepreneur_id, name, description || null, price, image_url || null, stock || 0]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', requireAuth, requireRole('entrepreneur'), async (req, res) => {
  const existing = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (!existing.rows.length) return res.status(404).json({ error: 'Product not found' });
  if (!(await ownsEntrepreneurProfile(req.user.id, existing.rows[0].entrepreneur_id))) {
    return res.status(403).json({ error: 'You can only edit your own products' });
  }
  const { name, description, price, image_url, stock } = req.body;
  const result = await query(
    `UPDATE products SET
      name = COALESCE($1, name), description = COALESCE($2, description),
      price = COALESCE($3, price), image_url = COALESCE($4, image_url), stock = COALESCE($5, stock)
     WHERE id = $6 RETURNING *`,
    [name, description, price, image_url, stock, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', requireAuth, requireRole('entrepreneur'), async (req, res) => {
  const existing = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (!existing.rows.length) return res.status(404).json({ error: 'Product not found' });
  if (!(await ownsEntrepreneurProfile(req.user.id, existing.rows[0].entrepreneur_id))) {
    return res.status(403).json({ error: 'You can only delete your own products' });
  }
  await query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

export default router;
