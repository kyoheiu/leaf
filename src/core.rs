use super::error::AcidError;
use super::handler::*;
use super::template::Hello;

use axum::response::Html;
use axum::{
    routing::{get, post},
    Router,
};
use log::info;
use std::{net::TcpListener, sync::Arc};
use tera::Tera;

pub struct Core {
    pub template: Tera,
    pub db: sqlite::ConnectionWithFullMutex,
}

pub fn router(core: Core) -> axum::Router {
    let shared_core = Arc::new(core);
    Router::new()
        .route("/", get(list_up))
        .route("/health", get(health))
        .route("/a", post(add))
        .route("/r/:id", get(read))
        .route("/d/:id", get(delete))
        .with_state(shared_core)
}

pub async fn run(listener: TcpListener, core: Core) {
    let router = router(core);

    axum::Server::from_tcp(listener)
        .expect("Failed to listen.")
        .serve(router.into_make_service())
        .await
        .unwrap();
}

impl Core {
    pub fn new() -> Result<Core, AcidError> {
        let connection = sqlite::Connection::open_with_full_mutex(".testdb").unwrap();
        connection
            .execute(
                "
            CREATE TABLE IF NOT EXISTS readers (
            id TEXT PRIMARY KEY,
            url TEXT,
            title TEXT,
            html BLOB,
            plain BLOB,
            timestamp DATETIME
            )
            ",
            )
            .unwrap();
        Ok(Core {
            template: tera::Tera::new("templates/*html")?,
            db: connection,
        })
    }

    pub async fn health(&self) -> Html<String> {
        let hello = Hello { name: "world" };
        Html(
            self.template
                .render(
                    "hello.html",
                    &tera::Context::from_serialize(&hello).unwrap(),
                )
                .unwrap(),
        )
    }

    pub async fn list_up(&self) -> String {
        let mut result = String::new();
        self.db
            .iterate(
                "
            SELECT *
            FROM readers
            ORDER BY id DESC",
                |pairs| {
                    for &(column, value) in pairs.iter() {
                        match column {
                            "id" => result.push_str(&format!("{}\n", value.unwrap())),
                            "title" => result.push_str(&format!("{}\n", value.unwrap())),
                            "url" => result.push_str(&format!("{}\n", value.unwrap())),
                            _ => {}
                        }
                    }
                    true
                },
            )
            .unwrap();
        result
    }

    pub async fn add(&self, url: &str) {
        let url_owned = url.to_owned();
        let handle =
            tokio::task::spawn_blocking(move || readability::extractor::scrape(&url_owned));
        let res = handle.await.unwrap();
        if let Ok(product) = res {
            let ulid = ulid::Ulid::new().to_string();
            let title = product.title.replace('\'', "''");
            let html = product.content.replace('\'', "''");
            let plain = product.text.replace('\'', "''");
            info!("{}: {} ({})", ulid, title, url);
            self.db
                .execute(format!(
                    "
                INSERT INTO readers (id, url, title, html, plain, timestamp)
                VALUES (
                    '{}',
                    '{}',
                    '{}',
                    '{}',
                    '{}',
                    datetime('now', 'localtime')
                );
                ",
                    ulid, url, title, html, plain
                ))
                .unwrap();
            info!("{}: {} ({})", ulid, title, url);
        }
    }

    pub async fn delete(&self, id: &str) {
        self.db
            .execute(format!(
                "
                DELETE FROM readers
                WHERE id = '{}';",
                id
            ))
            .unwrap();
        info!("DELETED: {}", id);
    }

    pub async fn read(&self, id: &str) -> String {
        let mut result = String::new();
        self.db
            .iterate(
                format!(
                    "
            SELECT *
            FROM readers
            WHERE id = '{}'",
                    id
                ),
                |pairs| {
                    for &(column, value) in pairs.iter() {
                        match column {
                            "id" => result.push_str(&format!("{}\n", value.unwrap())),
                            "title" => result.push_str(&format!("{}\n", value.unwrap())),
                            "url" => result.push_str(&format!("{}\n", value.unwrap())),
                            "plain" => result.push_str(value.unwrap()),
                            _ => {}
                        }
                    }
                    true
                },
            )
            .unwrap();
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use hyper::Method;
    use tower::ServiceExt;

    #[tokio::test]
    async fn test_health() {
        let core = Core::new().unwrap();
        let router = router(core);

        let response = router
            .oneshot(
                Request::builder()
                    .uri("/health")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);

        let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
        let body = String::from_utf8(body.to_vec()).unwrap();
        assert_eq!(body, "<h1>Hello, world!</h1>\n");
    }

    #[tokio::test]
    async fn test_add() {
        let core = Core::new().unwrap();
        let router = router(core);

        let response = router
            .oneshot(
                Request::builder()
                    .method(Method::POST)
                    .uri("/a?url=http://paulgraham.com/weird.html")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
