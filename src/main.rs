mod core;
mod error;
mod handler;
mod readble;

use crate::core::run;

use log::info;
use std::net::TcpListener;

use crate::core::Core;

#[tokio::main]
async fn main() {
    env_logger::init();
    let core = Core::new();
    let listener = TcpListener::bind("127.0.0.1:8000").expect("Failed to listen.");
    info!("Start listening on {:?}", listener);
    run(listener, core).await;
}

#[cfg(test)]
mod tests {
    use super::core::{router, Core};
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    #[tokio::test]
    async fn test_health() {
        let core = Core::new();
        let router = router(core);

        let response = router
            .oneshot(Request::builder().uri("/").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);

        let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
        let body = String::from_utf8(body.to_vec()).unwrap();
        assert_eq!(body, "Hello, world.");
    }
}
