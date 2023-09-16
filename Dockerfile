# stage build
FROM node:alpine3.18
WORKDIR /app

# copy everything to the container
COPY . .
# clean install all dependencies
RUN npm ci
# build SvelteKit app
RUN npm run build

# stage run
FROM alpine:3.18.3
WORKDIR /leaf

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium \
    npm \
    nodejs \
    ripgrep \
    && rm -rf /var/lib/apt/lists/* \
    # Cleanup
    && apk del --no-cache make gcc g++ binutils-gold gnupg libstdc++ \
    && rm -rf /usr/include \
    && rm -rf /var/cache/apk/* /root/.node-gyp /usr/share/man /tmp/* \
    && echo
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
# copy dependency list
COPY --from=0 /app/package*.json ./
COPY ./prisma/schema.prisma ./prisma/schema.prisma
# clean install dependencies, no devDependencies, no prepare script
RUN npm ci --omit=dev --ignore-scripts && npx prisma generate
# copy built SvelteKit app to /app
COPY --from=0 /app/build ./
EXPOSE 3000
CMD ["node", "./index.js"]
