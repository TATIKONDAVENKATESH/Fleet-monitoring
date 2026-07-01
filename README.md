# FleetOps — Real-Time Fleet Monitoring Platform

A full-stack fleet tracking system: vehicles stream GPS updates, the backend
detects overspeed/geofence/offline events in real time, and a live dashboard
shows everything on a map as it happens.

**Backend:** Spring Boot 3 (Java 21), PostgreSQL + Flyway, Redis (live-location
cache + pub/sub), STOMP over WebSocket, JWT auth with refresh-token rotation,
MapStruct, Spring Security method-level authorization.

**Frontend:** React 18 + TypeScript, MUI, Leaflet/react-leaflet, STOMP client,
React Router, Axios with automatic token refresh.

**Infra:** Docker Compose (Postgres, Redis, backend, frontend, Nginx reverse
proxy), GitHub Actions CI for both services plus a deploy workflow.

## Architecture

```
Browser ── Nginx :80 ──┬── /api, /ws, /swagger-ui, /actuator → Spring Boot :8080
                        └── everything else                  → React static build :80

Spring Boot ── PostgreSQL (system of record: users, vehicles, drivers, geofences, alerts)
            └─ Redis      (live-location cache + pub/sub fan-out to WebSocket)
```

Location ingestion flow: a POST to `/api/v1/tracking/location` persists a
`LocationHistory` row, updates the Redis live-location cache, evaluates
overspeed and geofence entry/exit rules, creates `Alert` rows where relevant,
and publishes both the location and any alert onto Redis pub/sub channels.
A `RedisSubscriber` picks those up and broadcasts them over STOMP to
`/topic/locations` and `/topic/alerts`, which the dashboard is subscribed to —
no polling. A scheduled job separately marks vehicles `OFFLINE` if no location
update has arrived within a configurable window.

## Running locally

```bash
cp backend/.env.example backend/.env   # set JWT_SECRET, DB credentials, etc.
docker compose up --build
```

- App: http://localhost (via Nginx)
- API docs: http://localhost/swagger-ui.html
- Backend directly: http://localhost:8080
- Frontend dev server (with hot reload): `cd frontend && npm install && npm run dev`
  — Vite proxies `/api` and `/ws` to `localhost:8080` in dev, so the backend
  must be running separately (`cd backend && ./mvnw spring-boot:run`).

Default seeded account: `admin@fleet.com` / `Admin@123` (see
`V1__initial_schema.sql` — change or remove this seed before any real deploy).

## Backend tests

```bash
cd backend && ./mvnw test
```

Unit tests cover auth and tracking business logic (`AuthServiceTest`,
`TrackingServiceTest`); `TrackingControllerIT` is a MockMvc integration test
against the `test` Spring profile.

## Known tradeoffs (by design, not oversights)

- **JWT/refresh tokens are stored in `localStorage`**, not httpOnly cookies.
  Simpler to implement and demo, but technically XSS-exposed — a cookie-based
  flow would be the production-grade alternative.
- **CORS allows all origins** (`allowedOriginPatterns("*")`) for ease of local
  development; in a real deployment this should be a specific allow-list
  driven by an environment variable.
- **No CSRF protection** — disabled because auth is stateless JWT-bearer, not
  cookie/session-based, so CSRF doesn't apply in the usual sense.

## Deployment

Deployed on a single **GCP Compute Engine VM** (Ubuntu 22.04, `asia-south1`),
running the full Docker Compose stack (Postgres, Redis, backend, frontend,
Nginx). CI builds and pushes backend/frontend images to GHCR; a separate
`deploy` job SSHes into the VM, pulls the new images, and does a rolling
`docker compose up -d` restart.

```
.github/workflows/deploy.yml
  docker-build  → builds & pushes images to ghcr.io on push to main
  deploy        → SSH into GCP VM, pull latest images, restart stack
```

Required repo secrets (set under **Settings → Environments → production**):

| Secret         | Purpose                                                       |
|----------------|----------------------------------------------------------------|
| `GCP_HOST`     | Static external IP of the Compute Engine VM                   |
| `GCP_USER`     | SSH user on the VM (`ubuntu`)                                  |
| `GCP_SSH_KEY`  | Private key paired with the public key in the VM's metadata   |

**Live app:** http://34.47.147.235

## Project structure

```
backend/   Spring Boot app (controller → service → repository, DTOs, MapStruct mappers)
frontend/  React app (pages, components, contexts, hooks, typed API client)
infra/     Nginx reverse-proxy config
.github/   CI (build + test per service) and a deploy workflow
```