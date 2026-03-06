# Lecturas y Alertas de Tanques – Integración Singleton + Observer

Implementación integrada de dos features del mismo proyecto:

- **Singleton (creacional):** configuración global única del sistema (`GlobalTankConfig`).
- **Observer (comportamiento):** evaluación de lecturas y notificación de alertas por umbrales.

Stack: **NestJS + Prisma + PostgreSQL** (backend) y **React + Vite** (frontend).

## Endpoints principales

### Singleton
- `GET /api/singleton/config`
- `PATCH /api/singleton/config`
- `POST /api/singleton/config/reset`

### Observer
- `POST /api/alerts/evaluate`
- `GET /api/alerts`
- `GET /api/alerts/active`
- `GET /api/alerts/:id`
- `PATCH /api/alerts/:id/resolve`
- `GET /api/alerts/tank/:tankId`

### Setup (Observer)
- `POST /api/setup/tanks`
- `GET /api/setup/tanks`
- `POST /api/setup/thresholds`
- `GET /api/setup/thresholds/:tankId`

## Ejecutar con Docker

```bash
docker compose up --build
```

Servicios:
- Frontend: `http://localhost:4173`
- API: `http://localhost:3000/api`
- PostgreSQL: `localhost:5432`
