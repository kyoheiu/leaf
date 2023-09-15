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
RUN apk add --no-cache nodejs npm ripgrep
# copy dependency list
COPY --from=0 /app/package*.json ./
# clean install dependencies, no devDependencies, no prepare script
RUN npm ci --omit=dev --ignore-scripts
# copy built SvelteKit app to /app
COPY --from=0 /app/build ./
EXPOSE 3000
CMD ["node", "./index.js"]
