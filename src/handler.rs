use super::core::Core;
use super::error::AcidError;

use axum::debug_handler;
use axum::extract::{Json, State};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct Payload {
    url: String,
}

#[debug_handler]
pub async fn health(State(_core): State<Arc<Core>>) -> String {
    "Hello, world.".to_string()
}

#[debug_handler]
pub async fn scrape(
    State(_core): State<Arc<Core>>,
    Json(payload): Json<Payload>,
) -> Result<String, AcidError> {
    let product = readability::extractor::scrape(&payload.url)?;
    Ok(product.title)
}
