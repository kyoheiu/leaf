FROM ekidd/rust-musl-builder:stable as builder
WORKDIR /home/server
COPY . .
RUN cargo build --release

FROM alpine:latest
WORKDIR /hmstr-server
# Installs latest Chromium package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn
COPY --from=builder /home/server/target/release/hmstr-server . 
ENV RUST_LOG info
ENV DATABASE_PATH "/var/hmstr/databases/.sqlite"
ENV SEARCH_PATH "/var/hmstr/databases/.search"
EXPOSE 8000
ENTRYPOINT [ "./hmstr-server" ]
