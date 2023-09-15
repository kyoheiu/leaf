<h1>leaf</h1>

Self-hostable "read-it-later" Web app.

<hr />

![screenshot](images/screenshot.png)

<hr />

## What is this exactly

- Save a web page by URL and read its content later.
- Save your progress automatically.
- Features:
  - like
  - archive
  - tagging
  - full-text search by `ripgrep`
- Via the client API, or the
  [Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/leaf-extension/),
  you can easily add new articles.

## New release

### v0.9.0

- Rewrite in SvelteKit, omit the server-side container.
- If you use v0.8.0 or before, an manual intervention is required.

### v0.8.0

- Use alpine to build image to reduce the size.

## Deploy

1. Before you start using this app, you have to initialize the sqlite database.

```sh
# pwd: /path/to/databases
cat create_table.sql | sqlite3 .sqlite
mkdir .index
```

2. Then `docker compose up -d` will do the work.

`docker-compose.yml` example:

```
version: '3'
services:
  leaf:
    image: docker.io/kyoheiudev/leaf:0.9.0
    container_name: leaf
    environment:
      - LEAF_DATA: /leaf/databases
      - LEAF_API_TOKEN: STRING_USED_WHEN_ADDDING_NEW_ARTICLE_VIA_API
    volumes:
      - /path/to/databases:/leaf/databases
      - /etc/localtime:/etc/localtime:ro
    ports:
      - 5173:5173
```

By default this app is not protected by any means so that you can use your own auth process.

## API

Via the client API you can add a new article:
>>>>>>> rewrite

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

- nodejs (front end)

```
npm install
npm run dev
```
