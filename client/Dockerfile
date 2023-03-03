FROM node:alpine AS base
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
FROM node:alpine AS node_modules

WORKDIR /modules

COPY package.json yarn.lock ./
RUN yarn install --non-interactive --frozen-lockfile --production

# ==================================================
FROM node:alpine
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
WORKDIR /app

COPY package.json yarn.lock next.config.js ./
COPY --from=build /build/public ./public
COPY --from=build /build/.next ./.next
COPY --from=node_modules /modules/node_modules ./node_modules

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

EXPOSE 3000

CMD ["yarn", "run", "start"]