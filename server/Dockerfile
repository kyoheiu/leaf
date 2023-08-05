FROM rust:latest as builder
WORKDIR /home/server
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /leaf-server
RUN apt-get -y update && apt-get -y upgrade
RUN apt-get -y install sqlite3
COPY --from=builder /home/server/target/release/leaf-server . 
ENV RUST_LOG info
ENV DATABASE_PATH "/var/leaf/databases/.sqlite"
ENV SEARCH_PATH "/var/leaf/databases/.search"
EXPOSE 8000
ENTRYPOINT [ "./leaf-server" ]
