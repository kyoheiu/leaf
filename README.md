<h1>leaf</h1>

Self-hostable "read-it-later" Web app.

Demo site is available [here](https://leaf-demo.kyoheiu.dev).  
Note that this demo site will be reset every hour.

## What is this exactly

- Save a web page by URL and read its content later.
- Save your progress automatically.
- Features:
  - like
  - archive
  - tagging
  - full-text search by `ripgrep`
- Via the client API, or the browser extension, you can easily add new articles.
  - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/leaf-extension/)
  - [Chrome](https://chrome.google.com/webstore/detail/leaf/almdhkbalnhgdmkfejpihbcfibbpmdkg)

## New release

## v1.2.1 (2024-01-05)

- Fixed the top bar menu position.
- Suspend saveScrollPos when there is no update.
- Remove viewTransition.

### v1.2.0 (2023-11-11)

- Add transition to pages and buttons.
- Make it more efficient to update the scroll position.
- Update `postcss` to 8.4.31.
- Update logging: Add url and title when liking / archiving / deleting.

### v1.1.2 (2023-10-24)

- Order search results by the date the article is added.

### v1.1.1 (2023-10-11)

- Fix back button lag by using `setInterval` / `clearInterval` in article pages.

## Deploy

1. To get started, you have to initialize the sqlite database and create an empty directory.

```sh
# pwd: /path/to/databases
echo "
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    url TEXT,
    title TEXT,
    html TEXT,
    cover TEXT,
    beginning TEXT,
    position INTEGER,
    progress INTEGER,
    archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
    liked INTEGER NOT NULL DEFAULT 0 CHECK (liked IN (0, 1)),
    timestamp DATETIME
);
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY,
    ulid TEXT,
    tag TEXT NOT NULL
);
" | sqlite3 .sqlite
mkdir .index
```

2. Then `docker compose up -d` will do the rest.

`docker-compose.yml` example:

```
version: '3'
services:
  leaf:
    image: docker.io/kyoheiudev/leaf:1.2.1
    container_name: leaf
    environment:
      - LEAF_DATA=/leaf/databases
      - LEAF_API_TOKEN=STRING_USED_WHEN_ADDING_NEW_ARTICLE_VIA_API
    volumes:
      - /path/to/databases:/leaf/databases
      - /etc/localtime:/etc/localtime:ro
    ports:
      - 3000:3000
```

By default this app is not protected by any means so that you can use your own auth process.

## API

Via the client API you can add a new article:

```http
POST /api/create
Content-Type: application/json
Authorization: LEAF_API_TOKEN

{
  "url": "https://example.com"
}
```

## Dev

### dev-prerequisites

- nodejs
- npm
- chromium

```
npm install
npm run dev
```
