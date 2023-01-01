use super::handler::health;

use axum::{routing::get, Extension, Router};
use std::sync::Arc;

#[derive(Clone)]
pub struct Core;

impl Core {
    pub fn new() -> Core {
        Core
    }

    pub async fn health(&self) -> String {
        "Hello, world.".to_string()
    }
}

pub fn router(core: Core) -> axum::Router {
    let shared_core = Arc::new(core);
    Router::new()
        .route("/", get(health))
        .layer(Extension(shared_core))
}
