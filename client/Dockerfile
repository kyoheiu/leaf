FROM node:slim AS base
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY . .

#==================================================
FROM base AS build
ENV NODE_ENV=production
WORKDIR /build

COPY --from=base /app ./
RUN yarn run build

# ==================================================
FROM node:slim AS node_modules

WORKDIR /modules

COPY package.json yarn.lock ./
RUN yarn install --non-interactive --frozen-lockfile --production

# ==================================================
FROM debian:stable-slim
ENV NODE_ENV=production
WORKDIR /app

COPY --from=node_modules /usr/local/include/ /usr/local/include/
COPY --from=node_modules /usr/local/lib/ /usr/local/lib/
COPY --from=node_modules /usr/local/bin/ /usr/local/bin/
# reset symlinks
RUN corepack disable && corepack enable

COPY package.json yarn.lock next.config.js ./
COPY --from=build /build/public ./public
COPY --from=build /build/.next ./.next
COPY --from=node_modules /modules/node_modules ./node_modules

EXPOSE 3000

CMD ["yarn", "run", "start"]