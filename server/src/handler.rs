use super::core::Core;
use super::error::AcidError;
use super::statements::{
    state_list_tag, state_list_up, state_list_up_archived, state_list_up_liked, state_reload,
    state_reload_archived, state_reload_liked,
};
use super::types::*;

use axum::debug_handler;
use axum::extract::{Json, Path, Query, State};
use log::info;
use std::collections::BTreeMap;
use std::str::FromStr;
use std::sync::Arc;

#[debug_handler]
pub async fn health(State(core): State<Arc<Core>>) -> String {
    core.health().await
}

#[debug_handler]
pub async fn list_up(
    State(core): State<Arc<Core>>,
    Query(param): Query<BTreeMap<String, String>>,
) -> Json<Vec<ArticleData>> {
    if param.contains_key("reload") {
        let id = param.get("reload").unwrap();
        info!("reload after {}", id);
        core.list_up(&state_reload(&id)).await
    } else {
        core.list_up(&state_list_up()).await
    }
}

#[debug_handler]
pub async fn list_up_archived(
    State(core): State<Arc<Core>>,
    Query(param): Query<BTreeMap<String, String>>,
) -> Json<Vec<ArticleData>> {
    if param.contains_key("reload") {
        let id = param.get("reload").unwrap();
        core.list_up(&state_reload_archived(&id)).await
    } else {
        core.list_up(&state_list_up_archived()).await
    }
}

#[debug_handler]
pub async fn list_up_liked(
    State(core): State<Arc<Core>>,
    Query(param): Query<BTreeMap<String, String>>,
) -> Json<Vec<ArticleData>> {
    if param.contains_key("reload") {
        let id = param.get("reload").unwrap();
        core.list_up(&state_reload_liked(&id)).await
    } else {
        core.list_up(&state_list_up_liked()).await
    }
}

#[debug_handler]
pub async fn create(State(core): State<Arc<Core>>, Json(payload): Json<Payload>) {
    info!("{:#?}", payload);
    core.create(payload).await;
}

#[debug_handler]
pub async fn read(State(core): State<Arc<Core>>, Path(id): Path<String>) -> Json<ArticleContent> {
    core.read(&id).await
}

#[debug_handler]
pub async fn delete_article(State(core): State<Arc<Core>>, Path(id): Path<String>) {
    core.delete(&id).await
}

#[debug_handler]
pub async fn update_article(
    State(core): State<Arc<Core>>,
    Path(id): Path<String>,
    Query(param): Query<BTreeMap<String, String>>,
    body: String,
) {
    if param.contains_key("toggle") {
        let to_toggle = param.get("toggle").unwrap();
        log::info!("query: {} {}", id, to_toggle);
        core.toggle(&id, &to_toggle).await
    } else if param.contains_key("pos") && param.contains_key("prog") {
        let pos = param.get("pos").unwrap().parse::<u16>().unwrap();
        let prog = param.get("prog").unwrap().parse::<u16>().unwrap();
        core.update_progress(&id, pos, prog).await
    } else if param.contains_key("kind") {
        if let Ok(kind) = Kind::from_str(param.get("kind").unwrap()) {
            match kind {
                Kind::Add => core.add_tag(&id, &body.trim().to_lowercase()).await,
                Kind::Delete => core.delete_tag(&id, &body.trim().to_lowercase()).await,
            }
        }
    } else {
    }
}

#[debug_handler]
pub async fn search(
    State(core): State<Arc<Core>>,
    Query(param): Query<BTreeMap<String, String>>,
) -> Json<Vec<ArticleData>> {
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

#[debug_handler]
pub async fn list_up_tag(
    State(core): State<Arc<Core>>,
    Path(name): Path<String>,
) -> Json<Vec<ArticleData>> {
    core.list_up(&state_list_tag(&name.to_lowercase())).await
}