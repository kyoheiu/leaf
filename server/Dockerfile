FROM rust:latest as builder
WORKDIR /home/server
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN apt-get update \
    && apt-get install -y chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /leaf-server
RUN apt-get -y update && apt-get -y upgrade
RUN apt-get -y install sqlite3
COPY --from=builder /home/server/target/release/leaf-server . 
ENV RUST_LOG info
ENV DATABASE_PATH "/var/leaf/databases/.sqlite"
ENV SEARCH_PATH "/var/leaf/databases/.search"
EXPOSE 8000
ENTRYPOINT [ "./leaf-server" ]
