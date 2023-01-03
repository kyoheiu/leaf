use super::core::Core;
use super::error::AcidError;

use axum::debug_handler;
use axum::extract::{Path, State};
use axum::response::Html;
use std::sync::Arc;

#[debug_handler]
pub async fn health(State(core): State<Arc<Core>>) -> Html<String> {
    core.health().await
}

#[debug_handler]
pub async fn list_up(State(core): State<Arc<Core>>) -> String {
    core.list_up().await
}

#[debug_handler]
pub async fn add(State(core): State<Arc<Core>>, body: String) {
    core.add(body.trim()).await;
}

#[debug_handler]
pub async fn read(State(core): State<Arc<Core>>, Path(id): Path<String>) -> Html<String> {
    core.read(&id).await
}

#[debug_handler]
pub async fn delete(State(core): State<Arc<Core>>, Path(id): Path<String>) {
    core.delete(&id).await
}
