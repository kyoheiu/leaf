use super::core::Core;
use super::error::AcidError;

use axum::debug_handler;
use axum::extract::{Json, State};
use axum::response::Html;
use serde::Deserialize;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct Payload {
    url: String,
}

#[debug_handler]
pub async fn health(State(core): State<Arc<Core>>) -> Html<String> {
    core.health().await
}

#[debug_handler]
pub async fn scrape(
    State(_core): State<Arc<Core>>,
    Json(payload): Json<Payload>,
) -> Result<String, AcidError> {
    let product = readability::extractor::scrape(&payload.url)?;
    Ok(product.title)
}
