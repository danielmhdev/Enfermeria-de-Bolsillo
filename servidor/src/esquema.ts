import { db } from "./base-datos.js";

// Tablas del servidor (R08F01T01). Las cuatro de contenido son las mismas
// que en la app; solo cambian los tipos. version solo existe aquí.
const ESQUEMA = `
CREATE TABLE IF NOT EXISTS farmaco (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  nombre_busqueda TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rango_dosis (
  id INTEGER PRIMARY KEY,
  farmaco_id INTEGER NOT NULL REFERENCES farmaco(id) ON DELETE CASCADE,
  via TEXT NOT NULL CHECK (via IN ('IV', 'VO', 'SC', 'IM')),
  indicacion TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('fija', 'por_kg')),
  dosis_min DOUBLE PRECISION NOT NULL,
  dosis_max DOUBLE PRECISION NOT NULL,
  intervalo_h DOUBLE PRECISION,
  max_diario DOUBLE PRECISION,
  peso_min_kg DOUBLE PRECISION,
  peso_max_kg DOUBLE PRECISION,
  nota TEXT,
  fuente TEXT NOT NULL,
  fuente_url TEXT NOT NULL,
  CHECK (dosis_min <= dosis_max)
);

CREATE TABLE IF NOT EXISTS escala (
  codigo TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  definicion JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS guia (
  codigo TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  arbol JSONB NOT NULL
);

-- Una fila por publicación; la versión actual es el numero más alto.
CREATE TABLE IF NOT EXISTS version (
  numero INTEGER PRIMARY KEY,
  publicada_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export async function crearTablas(): Promise<void> {
  await db.query(ESQUEMA);
}
