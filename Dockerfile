FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S nodejs && adduser -S app -G nodejs
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=app:nodejs /app/dist ./dist

USER app
EXPOSE 3000
CMD ["node", "dist/server.js"]
