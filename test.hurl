GET http://localhost:3000/api/health
HTTP 200

GET http://localhost:3000/
HTTP 307
Location: /api/auth/signin?callbackUrl=%2F

GET http://localhost:3000/archived
HTTP 307
Location: /api/auth/signin?callbackUrl=%2Farchived

GET http://localhost:3000/liked
HTTP 307
Location: /api/auth/signin?callbackUrl=%2Fliked

GET http://localhost:3000/search?q=rust
HTTP 307
Location: /api/auth/signin?callbackUrl=%2Fsearch%3Fq%3Drust

GET http://localhost:3000/tags/rust
HTTP 307
Location: /api/auth/signin?callbackUrl=%2Ftags%2Frust

GET http://localhost:3000/api/articles
HTTP 307

POST http://localhost:3000/api/articles
HTTP 307

POST http://localhost:3000/api/articles
HTTP 307

GET http://localhost:3000/api/articles/archived
HTTP 307

GET http://localhost:3000/api/articles/liked
HTTP 307

GET http://localhost:3000/api/search?query=rust
HTTP 307

GET http://localhost:3000/api/tags/rust
HTTP 307

GET http://localhost:3000/api/create
HTTP 404
