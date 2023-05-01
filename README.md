<h1>leaf</h1>

Instapaper is great, but you can self-host your own "read-later" Web app.

![https://img.shields.io/docker/image-size/kyoheiudev/leaf-client?label=leaf-client](https://img.shields.io/docker/image-size/kyoheiudev/leaf-client?label=leaf-client)
![https://img.shields.io/docker/image-size/kyoheiudev/leaf-server?label=leaf-server](https://img.shields.io/docker/image-size/kyoheiudev/leaf-server?label=leaf-server)

<hr />

![screenshot1.png](images/screenshot1.png)

![screenshot2.png](images/screenshot2.png)

![screenshot3.png](images/screenshot3.png)

<hr />

## What is this exactly

- Save a web page by URL and read only its content later.
- Specialized to "read": Use leaf to read text-based articles.
- Save your progress automatically.
- Features:
  - like
  - archive
  - tagging
  - full-text search (works only with languages based on the Latin script for
    now)
  - light/dark theme
  - built-in auth
- With the
  [Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/leaf-extension/),
  you can easily add new articles.

## Deploy

1. You just need 2 files: `docker-compose.yml` and `.env.production`.

`docker-compose.yml` example
```
version: "3"
services:
  server:
    image: docker.io/kyoheiudev/leaf-server:0.3.10
    container_name: leaf-server
    volumes:
      - ./server/databases:/var/leaf/databases
      - /etc/localtime:/etc/localtime:ro
    ports:
      - 8000:8000
  client:
    image: docker.io/kyoheiudev/leaf-client:0.3.10
    container_name: leaf-client
    volumes:
      - ./path/to/.env.production:/app/.env.production
    ports:
      - 3000:3000
```

`.env.production` example
```
NEXTAUTH_URL=https://your-site.url
NEXT_PUBLIC_TITLE=leaf
NEXT_PUBLIC_HOST=leaf-server
NEXTAUTH_SECRET=RANDOM_STRING_TO_BE_USED_WHEN_HASHING_THINGS
CREDENTIALS_ID=YOUR_ID
CREDENTIALS_PASSWORD=SO_STRONG_PASSWORD
WEB_API_TOKEN=WHICH_YOU_USE_WHEN_POST_NEW_ONE_VIA_EXTENSION
```

You should edit `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `CREDENTIALS_ID`, `CREDENTIALS_PASSWORD` and
`WEB_API_TOKEN`.

_You can add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to this file to make
it more secured with 2FA._

2. `docker compose up -d` and the app will start listening on port 3000.
   (The SQLite database and search index are created in the directory described in your `docker-compose.yml`)

## Architecture

![diagram.png](images/architecture.png)

### Tech stack

- TypeScript as the frontend
  - Next.js
  - Auth.js
  - MUI
- Rust as the backend
  - axum
  - headless-chrome to get contents
  - customized content extractor based on mozilla/readability
  - ammonia as the sanitizer
  - tantivy as the full-text search engine
- SQLite as the database

## Dev

### dev-prerequisites

- docker
- nodejs, cargo, make
- (optional) GitHub Account and its auth secret

Add `.env.development.local` to the `client` directory with the following:

```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_TITLE=leaf
NEXT_PUBLIC_HOST=127.0.0.1
NEXTAUTH_SECRET=RANDOM_STRING_TO_BE_USED_WHEN_HASHING_THINGS
CREDENTIALS_ID=test
CREDENTIALS_PASSWORD=test
GITHUB_CLIENT_ID=GITHUB_AUTH_CLIENT_ID
GITHUB_CLIENT_SECRET=GITHUB_AUTH_CLIENT_SECRET
WEB_API_TOKEN=test
```

And in the root directory:

```
cd client && yarn install
cd .. && make -i dev
```

Then you can see the page on `localhost:3000`.

## Report bug / Request features / Contribute
This repository is maintained on [https://git.sr.ht/~kyoheiu/leaf](https://git.sr.ht/~kyoheiu/leaf).
Contact me via email: ~kyoheiu/leaf@lists.sr.ht

## TODO

- Chrome extension
- Import & Export
