-- HunarHub PostgreSQL Schema
-- Run once against an empty database:  psql -U postgres -d hunarhub -f schema.sql

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS entrepreneurs CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'entrepreneur', 'admin')),
  phone         VARCHAR(20),
  location      VARCHAR(120),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(80) NOT NULL UNIQUE,
  slug  VARCHAR(80) NOT NULL UNIQUE,
  icon  VARCHAR(40) DEFAULT 'sparkle'
);

CREATE TABLE entrepreneurs (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  category_id      INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  business_name    VARCHAR(160) NOT NULL,
  bio              TEXT,
  skills           TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  location         VARCHAR(120),
  price_range_min  NUMERIC(10,2) DEFAULT 0,
  price_range_max  NUMERIC(10,2) DEFAULT 0,
  is_verified      BOOLEAN NOT NULL DEFAULT false,
  is_available     BOOLEAN NOT NULL DEFAULT true,
  cover_image_url  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id              SERIAL PRIMARY KEY,
  entrepreneur_id INTEGER NOT NULL REFERENCES entrepreneurs(id) ON DELETE CASCADE,
  name            VARCHAR(160) NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  image_url       TEXT,
  stock           INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE service_requests (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entrepreneur_id INTEGER NOT NULL REFERENCES entrepreneurs(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','completed','cancelled')),
  requested_date  DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entrepreneur_id INTEGER NOT NULL REFERENCES entrepreneurs(id) ON DELETE CASCADE,
  product_id      INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity        INTEGER NOT NULL DEFAULT 1,
  total_price     NUMERIC(10,2) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','delivered','cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id                  SERIAL PRIMARY KEY,
  customer_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entrepreneur_id     INTEGER NOT NULL REFERENCES entrepreneurs(id) ON DELETE CASCADE,
  order_id            INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  service_request_id  INTEGER REFERENCES service_requests(id) ON DELETE SET NULL,
  rating              INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entrepreneurs_category ON entrepreneurs(category_id);
CREATE INDEX idx_products_entrepreneur ON products(entrepreneur_id);
CREATE INDEX idx_service_requests_entrepreneur ON service_requests(entrepreneur_id);
CREATE INDEX idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_orders_entrepreneur ON orders(entrepreneur_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_reviews_entrepreneur ON reviews(entrepreneur_id);
