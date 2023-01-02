use crate::error::AcidError;

use super::handler::*;
use super::template::Hello;

use axum::response::Html;
use axum::{
    routing::{get, post},
    Router,
};
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
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT,
            html TEXT,
            plain TEXT,
            added DATETIME NOT NULL,
            original DATETIME
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
}

pub fn router(core: Core) -> axum::Router {
    let shared_core = Arc::new(core);
    Router::new()
        .route("/", get(health))
        .route("/post", post(scrape))
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
