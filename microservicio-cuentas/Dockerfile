# ============================================
# Stage 1: Build
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build && ls -la /app/dist

# ============================================
# Stage 2: Production
# ============================================
FROM node:18-alpine AS production

# Instalar wget para healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev && npm cache clean --force

# Copiar build desde stage anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Usuario no-root para seguridad
RUN addgroup -g 1001 nestjs && \
    adduser -D -u 1001 -G nestjs nestjs && \
    chown -R nestjs:nestjs /app

USER nestjs

# Puerto de la aplicación
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api-docs || exit 1

# Comando de inicio
CMD ["node", "dist/src/main.js"]
