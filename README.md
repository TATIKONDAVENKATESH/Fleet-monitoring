# FleetOps — Real-Time Fleet Monitoring Platform

🚀 **Live Demo:** [https://fleet-monitoring-nine.vercel.app](https://fleet-monitoring-nine.vercel.app)
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

**Backend:**
```bash
cd backend
cp .env.example .env   # set DB credentials, etc. if needed
./mvnw spring-boot:run
```
Make sure you have PostgreSQL running locally, or use an H2 in-memory database if configured. Redis is also needed for the pub/sub features.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Vite proxies `/api` and `/ws` to `localhost:8080` in dev, so the backend must be running.

No accounts are seeded. Create the first user (including an `ADMIN`) from the UI's **Sign up** page, or directly via:

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"Passw0rd!","role":"ADMIN"}'
```

## Backend tests

```bash
cd backend && ./mvnw test
```

Unit tests cover auth and tracking business logic (`AuthServiceTest`, `TrackingServiceTest`); `TrackingControllerIT` is a MockMvc integration test against the `test` Spring profile.

## Known tradeoffs (by design for learning purposes)

- **JWT/refresh tokens are stored in `localStorage`**, not httpOnly cookies. Simpler to implement and demo.
- **CORS allows all origins** (`allowedOriginPatterns("*")`) for ease of local development.
- **No CSRF protection** — disabled because auth is stateless JWT-bearer.