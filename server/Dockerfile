FROM rust:latest as builder
WORKDIR /home/server
COPY . .
RUN cargo build --release

FROM archlinux:latest
WORKDIR /hmstr-server
RUN pacman -Syu --noconfirm
RUN pacman -S openssl-1.1 --noconfirm
COPY --from=builder /home/server/target/release/hmstr-server . 
ENV RUST_LOG info
ENV DATABASE_PATH "/var/hmstr/databases/.sqlite"
ENV SEARCH_PATH "/var/hmstr/databases/.search"
EXPOSE 8000
ENTRYPOINT [ "./hmstr-server" ]
