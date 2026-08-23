import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/stats', async (req, res) => {
  const [entrepreneurs, users, orders, serviceRequests, avgRating] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM entrepreneurs'),
    query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'customer'`),
    query('SELECT COUNT(*)::int AS count, COALESCE(SUM(total_price),0)::numeric AS revenue FROM orders'),
    query('SELECT COUNT(*)::int AS count FROM service_requests'),
    query('SELECT COALESCE(AVG(rating),0)::numeric(3,2) AS avg FROM reviews'),
  ]);
  res.json({
    registeredEntrepreneurs: entrepreneurs.rows[0].count,
    activeUsers: users.rows[0].count,
    totalOrders: orders.rows[0].count,
    productSalesRevenue: orders.rows[0].revenue,
    totalServiceRequests: serviceRequests.rows[0].count,
    avgCustomerRating: avgRating.rows[0].avg,
  });
});

router.get('/entrepreneurs', async (req, res) => {
  const result = await query(
    `SELECT e.*, u.name AS owner_name, u.email, c.name AS category_name FROM entrepreneurs e
     JOIN users u ON u.id = e.user_id
     LEFT JOIN categories c ON c.id = e.category_id
     ORDER BY e.is_verified ASC, e.created_at DESC`
  );
  res.json(result.rows);
});

export default router;
