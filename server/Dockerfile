FROM rust:latest as builder
WORKDIR /home/server
COPY . .
RUN cargo build --release --locked

FROM debian:bookworm-slim
WORKDIR /leaf-server
RUN apt-get -y update && apt-get -y upgrade
RUN apt-get -y install sqlite3 ripgrep
COPY --from=builder /home/server/target/release/leaf-server . 
ENV RUST_LOG info
ENV DATABASE_PATH "/var/leaf/databases/.sqlite"
ENV INDEX_PATH "/var/leaf/databases/.index"
EXPOSE 8000
ENTRYPOINT [ "./leaf-server" ]
