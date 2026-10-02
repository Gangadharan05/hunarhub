import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const config = process.env.DATABASE_URL
  ? {
      // Production (Render + Neon): use the single connection string
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      // Local development: same as before
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      database: process.env.PGDATABASE || 'hunarhub',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
    };

export const pool = new Pool(config);

export const query = (text, params) => pool.query(text, params);