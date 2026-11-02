import 'dotenv/config';
import { createPool, type PoolConnection } from 'mysql2/promise';

export const pool = createPool({ uri: process.env.DATABASE_URL!, timezone: 'Z' });

export async function transaction<T>(callback: (conn: PoolConnection) => Promise<T>) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
