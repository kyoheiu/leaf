use std::net::TcpListener;

use axum::Router;

pub struct Core;

impl Core {
    pub fn new() -> Core {
        Core
    }

    pub async fn health_check(&self) -> String {
        "Hello, world.".to_string()
    }
}

pub async fn run(listner: TcpListener, core: Core) {
    let app = Router::new();

    axum::Server::from_tcp(listner)
        .unwrap()
        .serve(app.into_make_service())
        .await
        .unwrap();
}
