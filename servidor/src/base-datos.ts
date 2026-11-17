import pg from "pg";

// La dirección viene de DATABASE_URL.
export const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });
