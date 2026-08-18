import { sql } from '@vercel/postgres';

export async function query(queryText, params = []) {
  try {
    const result = await sql.query(queryText, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
