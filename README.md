# HunarHub — Digital Marketplace for Local Micro-Entrepreneurs

A full-stack web app connecting cobblers, potters, tailors, artisans, and small
vendors with local customers. Built to match the HunarHub PRD: entrepreneur
profiles, a handmade-product marketplace, service-request booking, order
management, ratings, and an admin console.

## Stack

- **Frontend:** React (Vite) + React Router + Bootstrap 5, with a custom design layer
- **Backend:** Node.js + Express, REST API, JWT authentication
- **Database:** PostgreSQL

## Project structure

```
hunarhub/
├── backend/
│   ├── db/
│   │   ├── schema.sql      # table definitions
│   │   └── seed.sql        # sample data (5 categories, 6 users, entrepreneurs, products, orders)
│   ├── src/
│   │   ├── db.js           # PostgreSQL connection pool
│   │   ├── server.js       # Express app entrypoint
│   │   ├── middleware/auth.js
│   │   └── routes/         # auth, categories, entrepreneurs, products,
│   │                       # serviceRequests, orders, reviews, admin
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/client.js       # fetch wrapper (adds JWT header)
    │   ├── context/AuthContext.jsx
    │   ├── components/         # Navbar, Footer, cards, ThreadDivider (signature motif), etc.
    │   ├── pages/               # Home, Browse, EntrepreneurProfile, Login, Register,
    │   │                        # CustomerDashboard, EntrepreneurDashboard, AdminDashboard
    │   └── styles/theme.css    # design tokens (colors, type, components)
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 1. Set up PostgreSQL

Create a database and load the schema + sample data:

```bash
createdb hunarhub
psql -U postgres -d hunarhub -f backend/db/schema.sql
psql -U postgres -d hunarhub -f backend/db/seed.sql
```

(Adjust the `-U` user to match your local Postgres setup, or use a GUI tool
like pgAdmin / TablePlus to run the two SQL files.)

## 2. Run the backend

```bash
cd backend
cp .env.example .env      # edit DB credentials + JWT_SECRET if needed
npm install
npm run dev                # http://localhost:5000
```

## 3. Run the frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000`, so
just open `http://localhost:5173` once both servers are running.

## Demo accounts (seeded, password for all: `Password123`)

| Role         | Email                          |
|--------------|---------------------------------|
| Admin        | admin@hunarhub.in              |
| Entrepreneur | ravi.cobbler@hunarhub.in        |
| Entrepreneur | meena.potter@hunarhub.in        |
| Customer     | priya.customer@hunarhub.in      |

## What's implemented (per the PRD)

**Customers:** register/login, browse & filter entrepreneurs by category/
location/search, view profiles with products & reviews, place service
requests, buy products, track orders/requests from a dashboard, leave reviews.

**Entrepreneurs:** register/login, create a storefront profile (category,
bio, skills, price range), list products, accept/reject/complete service
requests, confirm/deliver orders — all from one dashboard.

**Admin:** platform KPIs (registered entrepreneurs, active customers, order
count & revenue, service requests, average rating) and a table to verify
pending entrepreneur profiles.

## Notes & next steps

- Passwords are hashed with bcrypt; sessions use JWT (7-day expiry by default).
- The "Out of scope" items from the PRD (native mobile apps, international
  shipping, AI recommendations, logistics/delivery) were intentionally left out.
- Product images use a placeholder — wire up file storage (e.g. S3/Cloudinary)
  if you want real image uploads.
- For production, put the backend behind HTTPS, move `JWT_SECRET` to a real
  secrets manager, and run `npm run build` in `frontend/` to generate a static
  bundle you can deploy to Vercel/Netlify/any static host, with the API
  deployed separately (e.g. on a small VM, Render, or Railway) alongside a
  managed PostgreSQL instance.
