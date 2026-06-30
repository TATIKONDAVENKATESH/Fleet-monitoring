# ── Build stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Fix: use `npm install` which creates the lockfile if absent.
# To restore `npm ci` (faster, deterministic, recommended for production):
#   1. Run `npm install` locally to generate package-lock.json
#   2. Commit package-lock.json to version control
#   3. Change this line back to: RUN npm ci --silent
RUN npm install --verbose

COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Runtime stage: serve with Nginx ──────────────────────────────────────
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing: all paths fall back to index.html so React Router works
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    location /api/ {\n\
        proxy_pass http://fleet-backend:8080/;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    }\n\
    \n\
    # Serve static assets with long-lived cache headers\n\
    location ~* \.(js|css|png|svg|ico|woff2?)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
    # All other routes go to index.html for SPA routing\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
