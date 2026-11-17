import { type SQLiteDatabase } from "expo-sqlite";

// Tablas de la base de datos local (R01F01T01).
const ESQUEMA = `
CREATE TABLE IF NOT EXISTS farmaco (
  id INTEGER PRIMARY KEY NOT NULL,
  nombre TEXT NOT NULL UNIQUE,
  nombre_busqueda TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rango_dosis (
  id INTEGER PRIMARY KEY NOT NULL,
  farmaco_id INTEGER NOT NULL REFERENCES farmaco(id) ON DELETE CASCADE,
  via TEXT NOT NULL CHECK (via IN ('IV', 'VO', 'SC', 'IM')),
  indicacion TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('fija', 'por_kg')),
  dosis_min REAL NOT NULL,
  dosis_max REAL NOT NULL,
  intervalo_h REAL,
  max_diario REAL,
  peso_min_kg REAL,
  peso_max_kg REAL,
  nota TEXT,
  fuente TEXT NOT NULL,
  fuente_url TEXT NOT NULL,
  CHECK (dosis_min <= dosis_max)
);

CREATE TABLE IF NOT EXISTS tarea (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  texto TEXT NOT NULL CHECK (length(texto) <= 120),
  prioridad TEXT NOT NULL CHECK (prioridad IN ('alta', 'normal')),
  completada INTEGER NOT NULL DEFAULT 0 CHECK (completada IN (0, 1)),
  hora_alerta TEXT,
  notificacion_id TEXT,
  creada_en TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS escala (
  codigo TEXT PRIMARY KEY NOT NULL,
  nombre TEXT NOT NULL,
  definicion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS guia (
  codigo TEXT PRIMARY KEY NOT NULL,
  nombre TEXT NOT NULL,
  arbol TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ajuste (
  clave TEXT PRIMARY KEY NOT NULL,
  valor TEXT NOT NULL
);
`;

export async function crearTablas(db: SQLiteDatabase): Promise<void> {
  // SQLite no comprueba las claves ajenas si no se activa en cada conexión.
  await db.execAsync("PRAGMA foreign_keys = ON;");
  await db.execAsync(ESQUEMA);
}