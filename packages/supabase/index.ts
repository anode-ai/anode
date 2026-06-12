import { drizzle } from 'drizzle-orm/postgres-js';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import * as tenantsSchema from './src/schema/tenants';
import * as ragSchema from './src/schema/rag';

export const schema = { ...tenantsSchema, ...ragSchema };

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const getDb = () => {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    _db = drizzle(postgres(connectionString, { max: 1, prepare: false }), { schema });
  }
  return _db;
};

export type DbClient = ReturnType<typeof getDb>;

export const createSupabaseClient = (url: string, key: string) => {
  if (!url || !key) {
    return null as any;
  }
  return createClient(url, key);
};

export * from '@supabase/supabase-js';