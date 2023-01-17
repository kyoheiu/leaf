use super::error::AcidError;
use super::handler::*;
use super::schema::initialize_schema;
use super::statements::*;
use super::types::{ArticleContent, ArticleData};

use axum::Json;
use axum::{
    routing::{get, post},
    Router,
};
use log::info;
use percent_encoding::percent_decode;
use std::{net::TcpListener, sync::Arc};
use tantivy::collector::TopDocs;
use tantivy::schema::Schema;
use tantivy::Term;
use tower_http::cors::{Any, CorsLayer};

pub struct Core {
    pub db: sqlite::ConnectionWithFullMutex,
    pub schema: Schema,
    pub index: tantivy::Index,
    pub reader: tantivy::IndexReader,
}

pub fn router(core: Core) -> axum::Router {
    let shared_core = Arc::new(core);

    let origins = ["http://localhost:3000".parse().unwrap()];
    let layer = CorsLayer::new().allow_origin(origins).allow_headers(Any);

    Router::new()
        .route("/", get(list_up))
        .route("/health", get(health))
        .route("/a", post(add))
        .route("/r/:id", get(read))
        .route("/u", get(update_progress))
        .route("/d/:id", get(delete))
        .route("/s", get(search))
        .route("/t", get(toggle))
        .route("/p", get(reload))
        .route("/tag/:name", get(list_up_tag))
        .route("/manage_tag", post(manage_tag))
        .layer(layer)
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
        connection.execute(state_create_articles_table()).unwrap();
        connection.execute(state_create_tags_table()).unwrap();

        let (schema, index, reader) = initialize_schema();

        Ok(Core {
            db: connection,
            schema,
            index,
            reader,
        })
    }

    pub async fn list_up(&self, statement: &str) -> Json<Vec<ArticleData>> {
        let mut articles = vec![];
        self.db
            .iterate(statement, |pairs| {
                let mut article = ArticleData::new();
                for &(column, value) in pairs.iter() {
                    match column {
                        "id" => article.id = value.unwrap().to_owned(),
                        "title" => article.title = value.unwrap().to_owned(),
                        "url" => article.url = value.unwrap().to_owned(),
                        "beginning" => article.beginning = value.unwrap().to_owned(),
                        "progress" => article.progress = value.unwrap().parse().unwrap(),
                        "archived" => {
                            article.archived = if value.unwrap() == "0" { false } else { true }
                        }
                        "liked" => article.liked = if value.unwrap() == "0" { false } else { true },
                        "timestamp" => article.timestamp = value.unwrap().to_owned(),
                        "tag" => article.tags.push(value.unwrap().to_owned()),
                        _ => {}
                    }
                }
                articles.push(article);
                true
            })
            .unwrap();

        //get tags
        for mut article in articles.iter_mut() {
            let mut tags = vec![];
            let id = &article.id;
            self.db
                .iterate(state_list_tags(&id), |pairs| {
                    for &(column, value) in pairs.iter() {
                        match column {
                            "tag" => tags.push(value.unwrap().to_owned()),
                            _ => {}
                        }
                    }
                    true
                })
                .unwrap();
            article.tags = tags;
        }

        Json(articles)
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
                .execute(state_add(&ulid, &url, &title, &html, &plain, &beginning))
                .unwrap();

            //add to schema
            self.add_to_index(&ulid, &title, &plain);
        }
    }

    pub async fn delete(&self, id: &str) {
        self.db.execute(state_delete(id)).unwrap();
        info!("DELETED: {}", id);
        self.delete_from_index(id);
        info!("DELETED FROM INEX: {}", id);
    }

    pub async fn read(&self, id: &str) -> Json<ArticleContent> {
        let mut article = ArticleContent::new();
        self.db
            .iterate(state_read(id), |pairs| {
                for &(column, value) in pairs.iter() {
                    match column {
                        "id" => article.id = value.unwrap().to_owned(),
                        "url" => article.url = value.unwrap().to_owned(),
                        "title" => article.title = value.unwrap().to_owned(),
                        "html" => article.html = value.unwrap().to_owned(),
                        "plain" => article.plain = value.unwrap().to_owned(),
                        "position" => article.position = value.unwrap().parse().unwrap(),
                        "progress" => article.progress = value.unwrap().parse().unwrap(),
                        "timestamp" => article.timestamp = value.unwrap().parse().unwrap(),
                        _ => {}
                    }
                }
                true
            })
            .unwrap();
        Json(article)
    }

    pub async fn search(&self, query: &str) -> Json<Vec<ArticleData>> {
        info!("query: {}", query);
        let title = self.schema.get_field("title").unwrap();
        let plain = self.schema.get_field("plain").unwrap();
        let searcher = self.reader.searcher();
        let query_parser = tantivy::query::QueryParser::for_index(&self.index, vec![title, plain]);
        let query = query_parser.parse_query(query).unwrap();

        let mut top_docs = searcher.search(&query, &TopDocs::with_limit(10)).unwrap();
        top_docs.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());
        let mut articles = vec![];
        let field = self.schema.get_field("id").unwrap();
        for doc in top_docs {
            let mut article = ArticleData::new();
            let retrieved = searcher.doc(doc.1).unwrap();
            let id = retrieved.get_first(field).unwrap().as_text().unwrap();

            self.db
                .iterate(state_read(id), |pairs| {
                    for &(column, value) in pairs.iter() {
                        match column {
                            "id" => article.id = value.unwrap().to_owned(),
                            "url" => article.url = value.unwrap().to_owned(),
                            "title" => article.title = value.unwrap().to_owned(),
                            "beginning" => article.beginning = value.unwrap().to_owned(),
                            "progress" => article.progress = value.unwrap().parse().unwrap(),
                            "timestamp" => article.timestamp = value.unwrap().parse().unwrap(),
                            _ => {}
                        }
                    }
                    true
                })
                .unwrap();
            articles.push(article);
        }

        //get tags
        for mut article in articles.iter_mut() {
            let mut tags = vec![];
            let id = &article.id;
            self.db
                .iterate(state_list_tags(&id), |pairs| {
                    for &(column, value) in pairs.iter() {
                        match column {
                            "tag" => tags.push(value.unwrap().to_owned()),
                            _ => {}
                        }
                    }
                    true
                })
                .unwrap();
            article.tags = tags;
        }

        info!("{:#?}", articles);
        Json(articles)
    }

    pub async fn update_progress(&self, id: &str, pos: u16, prog: u16) {
        info!("id: {}, position: {}, progress: {}", id, pos, prog);
        self.db
            .execute(state_upgrade_progress(pos, prog, id))
            .unwrap();
    }

    pub async fn toggle(&self, id: &str, toggle: &str) {
        info!("id: {}, toggle: {}", id, toggle);
        self.db.execute(state_toggle(toggle, id)).unwrap();
        info!("TOGGLED: {} - {}", id, toggle);

        self.db
            .iterate(state_read(id), |pairs| {
                for &(column, value) in pairs.iter() {
                    match column {
                        "archived" => info!("now archived: {}", value.unwrap()),
                        "liked" => info!("now liked: {}", value.unwrap()),

                        _ => {}
                    }
                }
                true
            })
            .unwrap();
    }

    pub async fn add_tag(&self, id: &str, tag: &str) {
        self.db.execute(state_add_tag(id, tag)).unwrap();
        info!("Add tag {} to ID {}", tag, id);
    }

    pub async fn delete_tag(&self, id: &str, tag: &str) {
        self.db.execute(state_delete_tag(id, tag)).unwrap();
        info!("Add tag {} to ID {}", tag, id);
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

    fn delete_from_index(&self, id: &str) {
        let mut index_writer = self.index.writer(50_000_000).unwrap();
        let schema_id = self.schema.get_field("id").unwrap();
        let term = Term::from_field_text(schema_id, id);
        index_writer.delete_term(term);
        index_writer.commit().unwrap();
        drop(index_writer);
    }

    pub async fn health(&self) -> String {
        "Hello, world.".to_string()
    }
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
        assert_eq!(body, "Hello, world.\n");
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
