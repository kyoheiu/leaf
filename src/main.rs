mod core;
mod errors;
mod handler;
mod readble;

use crate::core::{router, Core};

#[tokio::main]
async fn main() {
    env_logger::init();
    let core = Core::new();

    // build our application with a route
    let router = router(core);

    // run it
    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], 8000));
    println!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(router.into_make_service())
        .await
        .unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::StatusCode;
    use axum_test_helper::TestClient;

    #[tokio::test]
    async fn test_main_router() {
        let core = Core::new();
        let router = router(core);
        let client = TestClient::new(router);
        let res = client.get("/").send().await;
        assert_eq!(res.status(), StatusCode::OK);
        assert_eq!(res.text().await, "Hello, world.");
    }
}
