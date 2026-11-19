# Enfermería de Bolsillo

App móvil de apoyo para el personal de enfermería de planta: calculadora de dosis y perfusiones, fármacos con comprobación de dosis, escalas de valoración (Glasgow, Braden y NEWS2), guía de curas y tareas del turno con alertas. Funciona sin conexión.

Proyecto intermodular del ciclo de Desarrollo de Aplicaciones Multiplataforma.

**Tecnologías:** React Native con Expo y SQLite en la app; Node.js, Express y PostgreSQL en el servidor.

## Estructura

```
movil/                 App (Expo SDK 58)
  src/app/             Pantallas: cada fichero es una ruta de expo-router
  src/componentes/     Piezas de interfaz reutilizables
  src/dominio/         Lógica sin dependencias de React ni de SQLite, con sus pruebas
  src/datos/           SQLite (tablas y repositorios), carga inicial, validación, sincronización y alertas
  src/datos/contenido/ Contenido incluido en la app para el primer arranque
  src/tema/            Colores, fuentes y márgenes
servidor/              API de contenido
  src/                 Express, PostgreSQL, validación y scripts
  contenido/           JSON que se publican en la base de datos
```

La app guarda todo en el móvil y solo usa la red para descargar contenido nuevo: `GET /api/v1/sync/version` y `GET /api/v1/sync/contenido`. Nunca envía datos. Las fichas técnicas de CIMA se abren en el navegador.

## Arrancar el servidor en local

Hace falta Docker.

```bash
cd servidor
cp .env.example .env
npm install
docker compose up -d --build   # PostgreSQL en el 5433 y la API en el 3000
npm run migrar                 # crea las tablas sin esperar a que arranque la API
npm run publicar               # valida contenido/*.json y publica una versión nueva
```

Comprobar que responde: `curl http://localhost:3000/api/v1/health`

## Arrancar la app

Hace falta Expo Go en el móvil.

```bash
cd movil
cp .env.example .env.local     # dirección del servidor
npm install
npx expo start                 # escanear el código QR con el móvil
```

Para usar el servidor local, en `.env.local` hay que poner la IP del ordenador: `EXPO_PUBLIC_API_URL=http://<IP>:3000/api/v1`. Cada vez que se cambia, hay que arrancar con `npx expo start --clear`.

## Pruebas

```bash
cd movil && npm test       # Jest
cd ../servidor && npm test # node:test
```

## Publicar contenido nuevo

1. Editar `servidor/contenido/*.json` y copiar los cambios en `movil/src/datos/contenido/`.
2. `npm run publicar` (local) o `npm run publicar:produccion` (Neon, con `servidor/.env.produccion`).
3. Los móviles descargan la versión nueva la próxima vez que se abre la app.

Si se añade una columna, se añade también en `servidor/src/tablas.ts`: el servidor la crea al desplegarse. Después se publica.

## Producción

API en Render (Docker) y base de datos en Neon (PostgreSQL 17). `servidor/.env.produccion` no está en el repositorio.
