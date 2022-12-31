mod core;
mod errors;
mod handler;
mod readble;

use crate::core::Core;

use axum::{routing::get, Extension, Router};
use handler::*;
use log::info;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    env_logger::init();
    info!("Server started.");

    let shared_core = Arc::new(Core::new());

    let app = Router::new()
        .route("/", get(health))
        .layer(Extension(shared_core));

    axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
