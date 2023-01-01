use crate::error::AcidError;

use super::handler::*;

use axum::{
    routing::{get, post},
    Router,
};
use std::{net::TcpListener, sync::Arc};
use tera::Tera;

#[derive(Clone)]
pub struct Core {
    pub template: Tera,
}

impl Core {
    pub fn new() -> Result<Core, AcidError> {
        Ok(Core {
            template: tera::Tera::new("templates/*html")?,
        })
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
