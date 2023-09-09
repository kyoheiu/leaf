FROM node:alpine3.18 AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

#==================================================
FROM base AS build
ENV NODE_ENV=production
WORKDIR /build

COPY --from=base /app ./
RUN npm run build

# ==================================================
FROM node:alpine3.18 AS node_modules

WORKDIR /modules

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ==================================================
FROM alpine:3.18.3
ENV NODE_ENV=production
WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium \
    npm \
    && rm -rf /var/lib/apt/lists/* \
    # Cleanup
    && apk del --no-cache make gcc g++ binutils-gold gnupg libstdc++ \
    && rm -rf /usr/include \
    && rm -rf /var/cache/apk/* /root/.node-gyp /usr/share/man /tmp/* \
    && echo
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package.json package-lock.json next.config.js ./
COPY --from=build /build/public ./public
COPY --from=build /build/.next ./.next
COPY --from=node_modules /modules/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
