Self-hostable Instapaper-ish document managing app. Heavily WIP, do not touch!

![screenshot.png](screenshots/screenshot.png)

## architecture

![diagram.png](screenshots/architecture.png)

### tech stack

- TypeScript as the frontend
  - Next.js
  - Auth.js (using GitHub account)
  - puppeteer (chromium)
  - MUI
- Rust as the backend
  - axum
  - ammonia as the sanitizer
  - tantivy as the full-text search engine
- SQLite as the database

## prerequisites

- docker
- (dev) nodejs, cargo
- (optional) GitHub Account and its auth secret

## dev

Add `.env.development.local` to the `client` directory with the following:

```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_TITLE=hmstr
NEXT_PUBLIC_HOST=127.0.0.1
NEXTAUTH_SECRET=RANDOM_STRING_TO_BE_USED_WHEN_HASHING_THINGS
CREDENTIALS_ID=test
CREDENTIALS_PASSWORD=test
GITHUB_CLIENT_ID=GITHUB_AUTH_CLIENT_ID
GITHUB_CLIENT_SECRET=GITHUB_AUTH_CLIENT_SECRET
WEB_API_TOKEN=test
```

_Basically you don't need GitHub Auth if you're satisfied by simple id &
password pair. When you need more robust 2FA auth, go to GitHub Auth._

And in the root directory:

```
make -i dev
```

Then you can see the page on `localhost:3000`.

## deploy

1. After `git clone` this repo, add `.env.production` to the `client` directory,
   which contains the following:

```
NEXTAUTH_URL=https://your-site.url
NEXT_PUBLIC_TITLE=hmstr
NEXT_PUBLIC_HOST=server
NEXTAUTH_SECRET=RANDOM_STRING_TO_BE_USED_WHEN_HASHING_THINGS
CREDENTIALS_ID=YOUR_ID
CREDENTIALS_PASSWORD=SO_STRONG_PASSWORD
GITHUB_CLIENT_ID=GITHUB_AUTH_CLIENT_ID
GITHUB_CLIENT_SECRET=GITHUB_AUTH_SECRET
WEB_API_TOKEN=WHICH_YOU_USE_WHEN_POST_NEW_ONE_VIA_I_E_CURL
```

2. `make run` and the Next.js client will begin listening on port 3000.
