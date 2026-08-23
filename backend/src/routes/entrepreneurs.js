import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const { category, location, search, minPrice, maxPrice } = req.query;
  const clauses = [];
  const params = [];

  if (category) {
    params.push(category);
    clauses.push(`c.slug = $${params.length}`);
  }
  if (location) {
    params.push(`%${location}%`);
    clauses.push(`e.location ILIKE $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    clauses.push(`(e.business_name ILIKE $${params.length} OR e.bio ILIKE $${params.length})`);
  }
  if (minPrice) {
    params.push(minPrice);
    clauses.push(`e.price_range_max >= $${params.length}`);
  }
  if (maxPrice) {
    params.push(maxPrice);
    clauses.push(`e.price_range_min <= $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `
    SELECT e.*, u.name AS owner_name, u.email, u.phone, c.name AS category_name, c.slug AS category_slug,
      COALESCE(AVG(r.rating), 0)::numeric(3,2) AS avg_rating,
      COUNT(DISTINCT r.id) AS review_count
    FROM entrepreneurs e
    JOIN users u ON u.id = e.user_id
    LEFT JOIN categories c ON c.id = e.category_id
    LEFT JOIN reviews r ON r.entrepreneur_id = e.id
    ${where}
    GROUP BY e.id, u.name, u.email, u.phone, c.name, c.slug
    ORDER BY e.is_verified DESC, avg_rating DESC, e.created_at DESC
  `;
  const result = await query(sql, params);
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const profile = await query(
    `SELECT e.*, u.name AS owner_name, u.email, u.phone, c.name AS category_name, c.slug AS category_slug,
      COALESCE(AVG(r.rating), 0)::numeric(3,2) AS avg_rating,
      COUNT(DISTINCT r.id) AS review_count
     FROM entrepreneurs e
     JOIN users u ON u.id = e.user_id
     LEFT JOIN categories c ON c.id = e.category_id
     LEFT JOIN reviews r ON r.entrepreneur_id = e.id
     WHERE e.id = $1
     GROUP BY e.id, u.name, u.email, u.phone, c.name, c.slug`,
    [id]
  );
  if (!profile.rows.length) return res.status(404).json({ error: 'Entrepreneur not found' });

  const products = await query('SELECT * FROM products WHERE entrepreneur_id = $1 ORDER BY created_at DESC', [id]);
  const reviews = await query(
    `SELECT r.*, u.name AS customer_name FROM reviews r
     JOIN users u ON u.id = r.customer_id
     WHERE r.entrepreneur_id = $1 ORDER BY r.created_at DESC`,
    [id]
  );

  res.json({ ...profile.rows[0], products: products.rows, reviews: reviews.rows });
});

// GET /api/entrepreneurs/me/profile (entrepreneur only - fetch own storefront, 404 if not created yet)
router.get('/me/profile', requireAuth, requireRole('entrepreneur'), async (req, res) => {
  const owned = await query(
    `SELECT e.*, c.name AS category_name, c.slug AS category_slug FROM entrepreneurs e
     LEFT JOIN categories c ON c.id = e.category_id
     WHERE e.user_id = $1`,
    [req.user.id]
  );
  if (!owned.rows.length) return res.status(404).json({ error: 'No storefront created yet' });
  const profile = owned.rows[0];
  const products = await query('SELECT * FROM products WHERE entrepreneur_id = $1 ORDER BY created_at DESC', [profile.id]);
  res.json({ ...profile, products: products.rows });
});

router.post('/', requireAuth, requireRole('entrepreneur'), async (req, res) => {
  const existing = await query('SELECT id FROM entrepreneurs WHERE user_id = $1', [req.user.id]);
  if (existing.rows.length) return res.status(409).json({ error: 'Profile already exists for this account' });

  const { category_id, business_name, bio, skills, experience_years, location, price_range_min, price_range_max, cover_image_url } = req.body;
  if (!business_name) return res.status(400).json({ error: 'business_name is required' });

  const result = await query(
    `INSERT INTO entrepreneurs
      (user_id, category_id, business_name, bio, skills, experience_years, location, price_range_min, price_range_max, cover_image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [req.user.id, category_id || null, business_name, bio || null, skills || [], experience_years || 0,
     location || null, price_range_min || 0, price_range_max || 0, cover_image_url || null]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', requireAuth, requireRole('entrepreneur'), async (req, res) => {
  const owned = await query('SELECT * FROM entrepreneurs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  if (!owned.rows.length) return res.status(403).json({ error: 'You can only edit your own profile' });

  const { category_id, business_name, bio, skills, experience_years, location, price_range_min, price_range_max, is_available, cover_image_url } = req.body;
  const result = await query(
    `UPDATE entrepreneurs SET
      category_id = COALESCE($1, category_id),
      business_name = COALESCE($2, business_name),
      bio = COALESCE($3, bio),
      skills = COALESCE($4, skills),
      experience_years = COALESCE($5, experience_years),
      location = COALESCE($6, location),
      price_range_min = COALESCE($7, price_range_min),
      price_range_max = COALESCE($8, price_range_max),
      is_available = COALESCE($9, is_available),
      cover_image_url = COALESCE($10, cover_image_url)
     WHERE id = $11 RETURNING *`,
    [category_id, business_name, bio, skills, experience_years, location, price_range_min, price_range_max, is_available, cover_image_url, req.params.id]
  );
  res.json(result.rows[0]);
});

router.patch('/:id/verify', requireAuth, requireRole('admin'), async (req, res) => {
  const result = await query('UPDATE entrepreneurs SET is_verified = true WHERE id = $1 RETURNING *', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Entrepreneur not found' });
  res.json(result.rows[0]);
});

export default router;
