use crate::error::AcidError;

use super::handler::*;
use super::template::Hello;

use axum::response::Html;
use axum::{
    routing::{get, post},
    Router,
};
use log::info;
use std::{net::TcpListener, sync::Arc};
use tera::Tera;

pub struct Core {
    pub template: Tera,
    pub db: sqlite::ConnectionWithFullMutex,
}

impl Core {
    pub fn new() -> Result<Core, AcidError> {
        let connection = sqlite::Connection::open_with_full_mutex(".testdb").unwrap();
        connection
            .execute(
                "
            CREATE TABLE IF NOT EXISTS readers (
            id TEXT PRIMARY KEY,
            url TEXT,
            title TEXT,
            html TEXT,
            plain TEXT,
            timestamp DATETIME
            )
            ",
            )
            .unwrap();
        Ok(Core {
            template: tera::Tera::new("templates/*html")?,
            db: connection,
        })
    }

    pub async fn health(&self) -> Html<String> {
        let hello = Hello { name: "world" };
        Html(
            self.template
                .render(
                    "hello.html",
                    &tera::Context::from_serialize(&hello).unwrap(),
                )
                .unwrap(),
        )
    }

    pub async fn add(&self, url: &str) {
        if let Ok(product) = readability::extractor::scrape(url) {
            let ulid = ulid::Ulid::new().to_string();
            let title = product.title;
            let html = product.content;
            let plain = product.text;
            self.db
                .execute(format!(
                    "
                INSERT INTO readers (id, url, title, html, plain, timestamp)
                VALUES (
                    '{}',
                    '{}',
                    '{}',
                    '{}',
                    '{}',
                    datetime('now', 'localtime')
                );
                ",
                    ulid, url, title, html, plain
                ))
                .unwrap();
            info!("{}: {} ({})", ulid, title, url);
        }
    }
}

pub fn router(core: Core) -> axum::Router {
    let shared_core = Arc::new(core);
    Router::new()
        .route("/", get(health))
        .route("/add", post(add))
        .with_state(shared_core)
}

pub async fn run(listener: TcpListener, core: Core) {
    let router = router(core);

    axum::Server::from_tcp(listener)
        .expect("Failed to listen.")
        .serve(router.into_make_service())
        .await
        .unwrap();
}
