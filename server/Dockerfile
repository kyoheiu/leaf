FROM rust:latest as builder
WORKDIR /home/server
COPY . .
RUN cargo build --release

FROM debian:stable-slim
WORKDIR /hmstr-server
RUN apt-get -y update && apt-get -y upgrade
RUN apt-get -y install sqlite3
COPY --from=builder /home/server/target/release/hmstr-server . 
ENV RUST_LOG info
ENV DATABASE_PATH "/var/hmstr/databases/.sqlite"
ENV SEARCH_PATH "/var/hmstr/databases/.search"
EXPOSE 8000
ENTRYPOINT [ "./hmstr-server" ]
