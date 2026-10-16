# syntax=docker/dockerfile:1
# Dockerfile Ultra-Optimizado Multi-Stage para INDI 2026
# Diseñado para Coolify / Oracle Cloud Always Free (ARM64 / AMD64)

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Fase 1: Dependencias
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Fase 2: Compilación (Builder)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivar telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Fase 3: Imagen de Producción Mínima (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos públicos y standalone optimizados
COPY --from=builder /app/public ./public

# Crear directorio .next y permisos para nextjs user
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar el paquete compilado standalone generado por Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
