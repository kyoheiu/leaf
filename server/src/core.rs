use crate::scrape::scrape_og;
use crate::types::Payload;

use super::error::AcidError;
use super::handler::*;
use super::schema::initialize_schema;
use super::statements::*;
use super::types::{ArticleContent, ArticleData};

use axum::Json;
use axum::{
    routing::{delete, get, post, put},
    Router,
};
use log::info;
use sanitize_html::rules::Element;
use sanitize_html::sanitize_str;
use std::{net::TcpListener, sync::Arc};
use tantivy::collector::TopDocs;
use tantivy::query::{BooleanQuery, Occur, Query, TermQuery};
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
    let layer = CorsLayer::new()
        .allow_origin(origins)
        .allow_headers(Any)
        .allow_methods(Any);

    Router::new()
        .route("/health", get(health))
        .route("/articles", get(list_up).post(create))
        .route("/articles/archived", get(list_up_archived))
        .route("/articles/liked", get(list_up_liked))
        .route(
            "/articles/:id",
            get(read).post(update_article).delete(delete_article),
        )
        .route("/search", get(search))
        .route("/tags/:name", get(list_up_tag))
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
                        "og" => article.og = value.unwrap().to_owned(),
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

    pub async fn create(&self, payload: Payload) {
        let url = payload.url;
        info!("url: {}", url);

        let mut input_u8 = payload.html.as_bytes();
        let url_reqwest = reqwest::Url::parse(&url).unwrap();
        let og = scrape_og(&payload.html);
        let extracted = readability_fork::extractor::extract(&mut input_u8, &url_reqwest);
        if let Ok(product) = extracted {
            let ulid = ulid::Ulid::new().to_string();
            let title = product.title.replace('\'', "''");

            let rule = sanitize_html::rules::predefined::default();
            let rule = rule
                .element(Element::new("a"))
                .element(Element::new("b"))
                .element(Element::new("code"))
                .element(Element::new("em"))
                .element(Element::new("h1"))
                .element(Element::new("h2"))
                .element(Element::new("h3"))
                .element(Element::new("h4"))
                .element(Element::new("h5"))
                .element(Element::new("h6"))
                .element(Element::new("i"))
                .element(Element::new("img"))
                .element(Element::new("strike"))
                .element(Element::new("strong"));
            let sanitized: String = sanitize_str(&rule, &product.content).unwrap();
            let html = sanitized.replace('\'', "''");

            let og = match og {
                Some(og) => og,
                None => "".to_owned(),
            };
            let plain = product.text.replace('\'', "''");
            info!("plain: {}", plain);
            let beginning = create_beginning(&plain);
            info!("beginning: {}", beginning);
            info!("{}: {} ({})", ulid, title, url);
            self.db
                .execute(state_add(
                    &ulid, &url, &title, &html, &og, &plain, &beginning,
                ))
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

        let mut queries = vec![];
        for query in query.split_whitespace() {
            let q_title: Box<dyn Query> = Box::new(TermQuery::new(
                Term::from_field_text(title, query),
                tantivy::schema::IndexRecordOption::Basic,
            ));
            let q_plain: Box<dyn Query> = Box::new(TermQuery::new(
                Term::from_field_text(plain, query),
                tantivy::schema::IndexRecordOption::Basic,
            ));
            queries.push((Occur::Should, q_title));
            queries.push((Occur::Must, q_plain));
        }
        let queries = BooleanQuery::new(queries);

        let searcher = self.reader.searcher();
        let found = searcher.search(&queries, &TopDocs::with_limit(50)).unwrap();

        let result: Vec<String> = found
            .iter()
            .map(|x| {
                let field = self.schema.get_field("id").unwrap();
                let id = searcher
                    .doc(x.1)
                    .unwrap()
                    .get_first(field)
                    .unwrap()
                    .as_text()
                    .unwrap()
                    .to_owned();
                id
            })
            .collect();

        let mut articles = vec![];
        for id in result {
            let mut article = ArticleData::new();
            self.db
                .iterate(state_read(&id), |pairs| {
                    for &(column, value) in pairs.iter() {
                        match column {
                            "id" => article.id = value.unwrap().to_owned(),
                            "url" => article.url = value.unwrap().to_owned(),
                            "title" => article.title = value.unwrap().to_owned(),
                            "beginning" => article.beginning = value.unwrap().to_owned(),
                            "progress" => article.progress = value.unwrap().parse().unwrap(),
                            "archived" => {
                                article.archived = if value.unwrap() == "0" { false } else { true }
                            }
                            "liked" => {
                                article.liked = if value.unwrap() == "0" { false } else { true }
                            }
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
        info!("Delete tag {} to ID {}", tag, id);
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
