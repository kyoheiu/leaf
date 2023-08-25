FROM node:slim AS base
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
FROM node:slim AS node_modules

WORKDIR /modules

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ==================================================
FROM debian:bookworm-slim
ENV NODE_ENV=production
WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN apt-get -y update && apt-get -y upgrade
RUN apt-get install -y chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=node_modules /usr/local/include/ /usr/local/include/
COPY --from=node_modules /usr/local/lib/ /usr/local/lib/
COPY --from=node_modules /usr/local/bin/ /usr/local/bin/
# reset symlinks
RUN corepack disable && corepack enable

COPY package.json package-lock.json next.config.js ./
COPY --from=build /build/public ./public
COPY --from=build /build/.next ./.next
COPY --from=node_modules /modules/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
