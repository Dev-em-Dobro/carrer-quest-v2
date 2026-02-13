import { Pool } from "pg";

declare global {
    // eslint-disable-next-line no-var
    var _neonPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL não está definido no .env");
}

export const pool = globalThis._neonPool ?? new Pool({ connectionString });

if (process.env.NODE_ENV !== "production") {
    globalThis._neonPool = pool;
}

export async function sql<T = unknown>(text: string, params: unknown[] = []) {
    const result = await pool.query<T>(text, params);
    return result.rows;
}
