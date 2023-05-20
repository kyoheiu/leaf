GET http://localhost:3000/api/health
HTTP 200

GET http://localhost:3000/
HTTP 307
Location: /api/auth/signin

GET http://localhost:3000/archived
HTTP 307
Location: /api/auth/signin

GET http://localhost:3000/liked
HTTP 307
Location: /api/auth/signin

GET http://localhost:3000/search?q=rust
HTTP 307
Location: /api/auth/signin

GET http://localhost:3000/tags/rust
HTTP 307
Location: /api/auth/signin

GET http://localhost:3000/api/articles
HTTP 303

POST http://localhost:3000/api/articles
HTTP 303

POST http://localhost:3000/api/articles
HTTP 303

GET http://localhost:3000/api/articles/archived
HTTP 303

GET http://localhost:3000/api/articles/liked
HTTP 303

GET http://localhost:3000/api/search?query=rust
HTTP 303

GET http://localhost:3000/api/tags/rust
HTTP 303

GET http://localhost:3000/api/create
HTTP 404
