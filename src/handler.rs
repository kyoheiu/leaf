use super::core::Core;

use axum::{debug_handler, Extension};
use std::sync::Arc;

#[debug_handler]
pub async fn health(Extension(core): Extension<Arc<Core>>) -> String {
    core.health_check().await
}
