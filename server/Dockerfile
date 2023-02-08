FROM rust:latest as builder
WORKDIR /home/server
COPY . .
RUN cargo build --release

FROM archlinux:latest
WORKDIR /acidpaper-server
RUN pacman -Syu --noconfirm
RUN pacman -S openssl-1.1 --noconfirm
COPY --from=builder /home/server/target/release/acidpaper-server . 
ENV RUST_LOG info
ENV DATABASE_PATH "/home/server/databases/.sqlite"
ENV SEARCH_PATH "/home/server/databases/.search"
EXPOSE 8000
ENTRYPOINT [ "./acidpaper-server" ]
