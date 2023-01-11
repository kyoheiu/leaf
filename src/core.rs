use crate::schema::initialize_schema;

use super::error::AcidError;
use super::handler::*;
use super::template::Article;
use super::template::Hello;

use axum::response::{Html, IntoResponse};
use axum::routing::get_service;
use axum::{
    routing::{get, post},
    Router,
};
use hyper::{HeaderMap, StatusCode};
use log::info;
use percent_encoding::percent_decode;
use std::{net::TcpListener, sync::Arc};
use tantivy::collector::TopDocs;
use tantivy::schema::Schema;
use tera::Tera;
use tower_http::services::ServeDir;

pub struct Core {
    pub template: Tera,
    pub db: sqlite::ConnectionWithFullMutex,
    pub schema: Schema,
    pub index: tantivy::Index,
    pub reader: tantivy::IndexReader,
}

pub fn router(core: Core) -> axum::Router {
    let shared_core = Arc::new(core);
    let serve_dir = get_service(ServeDir::new("static")).handle_error(handle_error);
    Router::new()
        .route("/", get(list_up))
        .route("/health", get(health))
        .route("/a", post(add))
        .route("/r/:id", get(read))
        .route("/u", get(update_progress))
        .route("/g", get(get_position))
        .route("/d/:id", get(delete))
        .route("/s", get(search))
        .nest_service("/static", serve_dir)
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
            html TEXT,
            plain TEXT,
            beginning TEXT,
            position INTEGER,
            progress INTEGER,
            timestamp DATETIME
            )
            ",
            )
            .unwrap();

        let (schema, index, reader) = initialize_schema();

        Ok(Core {
            template: tera::Tera::new("templates/*html")?,
            db: connection,
            schema,
            index,
            reader,
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

    pub async fn list_up(&self) -> Html<String> {
        let mut articles = vec![];
        self.db
            .iterate(
                "
            SELECT *
            FROM readers
            ORDER BY id DESC
            LIMIT 10",
                |pairs| {
                    let mut article = Article::new();
                    for &(column, value) in pairs.iter() {
                        match column {
                            "id" => article.id = value.unwrap().to_owned(),
                            "title" => article.title = value.unwrap().to_owned(),
                            "url" => article.url = value.unwrap().to_owned(),
                            "html" => article.html = value.unwrap().to_owned(),
                            "beginning" => article.beginning = value.unwrap().to_owned(),
                            "progress" => article.progress = value.unwrap().parse().unwrap(),
                            "timestamp" => article.timestamp = value.unwrap().to_owned(),
                            _ => {}
                        }
                    }
                    articles.push(article);
                    true
                },
            )
            .unwrap();

        let mut context = tera::Context::new();
        context.insert("articles", &articles);
        Html(self.template.render("index.html", &context).unwrap())
    }

    pub async fn add(&self, url: &str) {
        let url = url.as_bytes();
        let url = percent_decode(url).decode_utf8().unwrap().to_string();
        let url_owned = url.to_owned();
        info!("URL to be added: {}", url);
        let handle =
            tokio::task::spawn_blocking(move || readability::extractor::scrape(&url_owned));
        let res = handle.await.unwrap();
        if let Ok(product) = res {
            let ulid = ulid::Ulid::new().to_string();
            let title = product.title.replace('\'', "''");
            let html = product.content.replace('\'', "''");
            let plain = product.text.replace('\'', "''");
            info!("plain: {}", plain);
            let beginning = create_beginning(&plain);
            info!("beginning: {}", beginning);
            info!("{}: {} ({})", ulid, title, url);
            self.db
                .execute(format!(
                    "
                INSERT INTO readers (id, url, title, html, plain, beginning, position, progress, timestamp)
                VALUES (
                    '{}',
                    '{}',
                    '{}',
                    '{}',
                    '{}',
                    '{}',
                    0,
                    0,
                    datetime('now', 'localtime')
                );
                ",
                    ulid, url, title, html, plain, beginning
                ))
                .unwrap();

            //add to schema
            self.add_to_index(&ulid, &title, &plain);
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

    pub async fn read(&self, id: &str) -> impl IntoResponse {
        let mut article = Article::new();
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
                            "title" => article.title = value.unwrap().to_owned(),
                            "url" => article.url = value.unwrap().to_owned(),
                            "html" => article.html = value.unwrap().to_owned(),
                            "position" => article.position = value.unwrap().parse().unwrap(),
                            _ => {}
                        }
                    }
                    true
                },
            )
            .unwrap();

        info!("pos: {}", article.position);
        let mut headers = HeaderMap::new();
        headers.insert("POSITION", article.position.into());

        (
            headers,
            Html(
                self.template
                    .render(
                        "article.html",
                        &tera::Context::from_serialize(&article).unwrap(),
                    )
                    .unwrap(),
            ),
        )
    }

    pub async fn search(&self, query: &str) {
        let title = self.schema.get_field("title").unwrap();
        let plain = self.schema.get_field("plain").unwrap();
        let searcher = self.reader.searcher();
        let query_parser = tantivy::query::QueryParser::for_index(&self.index, vec![title, plain]);
        let query = query_parser.parse_query(query).unwrap();

        let top_docs = searcher.search(&query, &TopDocs::with_limit(10)).unwrap();
        for (score, doc_address) in top_docs {
            let retrieved = searcher.doc(doc_address).unwrap();
            println!("score: {}", score);
            println!("{}", self.schema.to_json(&retrieved));
        }
    }

    pub async fn update_progress(&self, id: &str, pos: u16, prog: u16) {
        info!("id: {}, position: {}, progress: {}", id, pos, prog);
        self.db
            .execute(format!(
                "
        UPDATE readers 
        SET position = '{}',
            progress = '{}'
        WHERE id = '{}'
        ",
                pos, prog, id
            ))
            .unwrap();
    }

    pub async fn get_position(&self, id: &str) -> String {
        let mut pos = String::new();
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
                            "position" => pos = value.unwrap().to_owned(),
                            _ => {}
                        }
                    }
                    true
                },
            )
            .unwrap();

        info!("initial_pos: {}", pos);
        pos
    }

    //add to schema
    fn add_to_index(&self, ulid: &str, title: &str, plain: &str) {
        let mut index_writer = self.index.writer(50_000_000).unwrap();
        let schema_id = self.schema.get_field("id").unwrap();
        let schema_title = self.schema.get_field("title").unwrap();
        let schema_plain = self.schema.get_field("plain").unwrap();
        index_writer
            .add_document(tantivy::doc!(
                schema_id => ulid,
                schema_title => title,
                schema_plain => plain
            ))
            .unwrap();
        index_writer.commit().unwrap();
        drop(index_writer);
    }
}

async fn handle_error(_err: std::io::Error) -> impl IntoResponse {
    (StatusCode::INTERNAL_SERVER_ERROR, "Something went wrong...")
}

fn create_beginning(s: &str) -> String {
    let mut result: String = s
        .chars()
        .filter(|x| !x.is_ascii_control())
        .take(97)
        .collect();
    result.push_str("...");
    result
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
