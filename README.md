Self-hostable Instapaper-ish document managing app.
Heavily WIP, do not touch!

## Dev
In the root directory:
```
make init
make dev 
```

## Prod
1. After `git clone` this repo, add `.env.production` to the `client` directory, which contains the following:
```
NEXT_PUBLIC_HOST=server # fixed
NEXTAUTH_SECRET=RANDOM_STRING_TO_BE_USED_WHEN_HASHING_THINGS
GITHUB_CLIENT_ID=GITHUB_AUTH_CLIENT_ID
GITHUB_CLIENT_SECRET=GITHUB_AUTH_SECRET
```
2. `make run` and the Next.js client will begin listening on port 3000.