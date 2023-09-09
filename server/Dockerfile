FROM rust:1-alpine3.18 as builder
WORKDIR /leaf-server-builder
COPY . .
RUN apk update && apk add --no-cache musl-dev
RUN cargo build --release --locked

FROM alpine:3.18.3
WORKDIR /leaf-server
RUN apk update \
    && apk upgrade \
    && apk add --no-cache sqlite ripgrep
COPY --from=builder /leaf-server-builder/target/release/leaf-server . 
ENV RUST_LOG info
ENV DATABASE_PATH "/var/leaf/databases/.sqlite"
ENV INDEX_PATH "/var/leaf/databases/.index"
EXPOSE 8000
ENTRYPOINT [ "./leaf-server" ]
