use super::core::Core;
use super::error::AcidError;

use axum::debug_handler;
use axum::extract::{Path, Query, State};
use axum::response::Html;
use std::collections::BTreeMap;
use std::sync::Arc;

#[debug_handler]
pub async fn health(State(core): State<Arc<Core>>) -> Html<String> {
    core.health().await
}

#[debug_handler]
pub async fn list_up(State(core): State<Arc<Core>>) -> Html<String> {
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

#[debug_handler]
pub async fn update_progress(
    State(core): State<Arc<Core>>,
    Query(param): Query<BTreeMap<String, String>>,
) {
    let mut id = String::new();
    let mut pos = 0;
    for (k, v) in param {
        if k == "id" {
            id = v;
        } else if k == "scrollposition" {
            pos = v.parse::<u8>().unwrap();
        } else {
            continue;
        }
    }
    core.update_progress(&id, pos).await
}
