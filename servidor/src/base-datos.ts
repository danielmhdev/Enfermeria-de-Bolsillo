import pg from "pg";

// Conexión a PostgreSQL. La dirección viene de la variable DATABASE_URL.
export const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });
