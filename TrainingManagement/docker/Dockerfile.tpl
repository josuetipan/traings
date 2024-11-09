# Usa una imagen base ligera de Node.js
FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npm install @nestjs/cli

RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3000

# Ejecuta las migraciones y luego la aplicación
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
