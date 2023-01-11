use super::core::Core;
use super::error::AcidError;

use axum::debug_handler;
use axum::extract::{Path, Query, State};
use axum::response::{Html, IntoResponse};
use hyper::HeaderMap;
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
pub async fn read(State(core): State<Arc<Core>>, Path(id): Path<String>) -> impl IntoResponse {
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
    let mut prog = 0;
    for (k, v) in param {
        if k == "id" {
            id = v;
        } else if k == "pos" {
            pos = v.parse::<u16>().unwrap();
        } else if k == "prog" {
            prog = v.parse::<u16>().unwrap();
        } else {
            continue;
        }
    }
    core.update_progress(&id, pos, prog).await
}

#[debug_handler]
pub async fn get_position(
    State(core): State<Arc<Core>>,
    Query(param): Query<BTreeMap<String, String>>,
) -> HeaderMap {
    let mut id = String::new();
    for (k, v) in param {
        if k == "id" {
            id = v;
        } else {
            continue;
        }
    }

    let mut header = HeaderMap::new();
    header.insert(
        "Initial-Position",
        core.get_position(&id).await.parse().unwrap(),
    );
    header
}

#[debug_handler]
pub async fn search(State(core): State<Arc<Core>>, Query(param): Query<BTreeMap<String, String>>) {
    let mut query = String::new();
    for (k, v) in param {
        if k == "q" {
            query = v;
        } else {
            continue;
        }
    }
    core.search(&query).await
}
