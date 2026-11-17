import pg from "pg";

// Sin esto, pg se conectaría a localhost:5432 por defecto.
if (process.env.DATABASE_URL === undefined) {
  throw new Error("Falta la variable DATABASE_URL.");
}

export const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });
