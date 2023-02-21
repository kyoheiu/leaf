# Base Layer
FROM node:slim AS base
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY . .

#==================================================
# Build Layer
FROM base AS build
ENV NODE_ENV=production
WORKDIR /build

COPY --from=base /app ./
RUN yarn run build

# ==================================================
# Package install Layer
FROM node:slim AS node_modules

WORKDIR /modules

COPY package.json yarn.lock ./
RUN yarn install --non-interactive --frozen-lockfile --production

# ==================================================
# Production Run Layer
FROM node:slim
ENV NODE_ENV=production
WORKDIR /app

COPY package.json yarn.lock next.config.js .env.production ./
COPY --from=build /build/public ./public
COPY --from=build /build/.next ./.next
COPY --from=node_modules /modules/node_modules ./node_modules

EXPOSE 3000

CMD ["yarn", "run", "start"]