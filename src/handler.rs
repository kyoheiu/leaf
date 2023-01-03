use super::core::Core;
use super::error::AcidError;

use axum::debug_handler;
use axum::extract::{Json, Path, Query, State};
use axum::response::Html;
use serde::Deserialize;
use std::collections::BTreeMap;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct Payload {
    url: String,
}

#[debug_handler]
pub async fn health(State(core): State<Arc<Core>>) -> Html<String> {
    core.health().await
}

pub async fn list_up(State(core): State<Arc<Core>>) -> String {
    core.list_up().await
}

#[debug_handler]
pub async fn add(State(core): State<Arc<Core>>, Query(params): Query<BTreeMap<String, String>>) {
    for (k, v) in params {
        if k == "url" {
            core.add(&v).await;
        }
    }
}

pub async fn read(State(core): State<Arc<Core>>, Path(id): Path<String>) -> String {
    core.read(id).await
}

#[debug_handler]
pub async fn scrape(
    State(_core): State<Arc<Core>>,
    Json(payload): Json<Payload>,
) -> Result<String, AcidError> {
    let product = readability::extractor::scrape(&payload.url)?;
    Ok(product.title)
}
