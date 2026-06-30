# ── Build stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Runtime stage: serve with Nginx ──────────────────────────────────────
# This container only serves the built static assets. API and WebSocket
# routing is handled by the top-level reverse proxy (infra/nginx/nginx.conf)
# so there is a single source of truth for routing rules.
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing: all paths fall back to index.html so React Router works
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    # Serve static assets with long-lived cache headers\n\
    location ~* \\.(js|css|png|svg|ico|woff2?)$ {\n\
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