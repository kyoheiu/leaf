use super::error::HmstrError;
use super::handler::*;
use super::schema::initialize_schema;
use super::statements::*;
use super::types::{ArticleContent, ArticleData, Payload};

use axum::Json;
use axum::{routing::get, Router};
use std::path::PathBuf;
use std::{net::TcpListener, sync::Arc};
use tantivy::collector::TopDocs;
use tantivy::query::{BooleanQuery, Occur, Query, TermQuery};
use tantivy::schema::Schema;
use tantivy::Term;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

const SEARCH_LIMIT: usize = 100;
const BEGINNING_LENGTH: usize = 100;

pub struct Core {
    pub db: sqlite::ConnectionWithFullMutex,
    pub schema: Schema,
    pub index: tantivy::Index,
    pub reader: tantivy::IndexReader,
}

pub fn router(core: Core) -> axum::Router {
    let shared_core = Arc::new(core);

    // let origins = ["http://0.0.0.0:3000".parse().unwrap()];
    let layer = CorsLayer::new()
        .allow_origin(Any)
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

    tracing_subscriber::fmt().init();

    axum::Server::from_tcp(listener)
        .expect("Failed to listen.")
        .serve(router.into_make_service())
        .await
        .unwrap();
}

impl Core {
    pub fn new() -> Result<Core, HmstrError> {
        let db_path = match std::env::var("DATABASE_PATH") {
            Ok(p) => PathBuf::from(&p),
            Err(_) => PathBuf::from("./databases/.sqlite"),
        };
        let parent = db_path.parent().unwrap();
        if !parent.exists() {
            std::fs::create_dir_all(parent)?;
        }
        let connection = sqlite::Connection::open_with_full_mutex(&db_path)?;
        connection.execute(state_create_articles_table())?;
        connection.execute(state_create_tags_table())?;

        let (schema, index, reader) = initialize_schema();

        Ok(Core {
            db: connection,
            schema,
            index,
            reader,
        })
    }

    pub async fn list_up(&self, statement: &str) -> Result<Json<Vec<ArticleData>>, HmstrError> {
        let mut articles = vec![];
        self.db.iterate(statement, |pairs| {
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
        })?;

        //get tags
        for mut article in articles.iter_mut() {
            let mut tags = vec![];
            let id = &article.id;
            self.db.iterate(state_list_tags(&id), |pairs| {
                for &(column, value) in pairs.iter() {
                    match column {
                        "tag" => tags.push(value.unwrap().to_owned()),
                        _ => {}
                    }
                }
                true
            })?;
            article.tags = tags;
        }

        Ok(Json(articles))
    }

    pub async fn create(&self, payload: &Payload) -> Result<(), HmstrError> {
        let ulid = ulid::Ulid::new().to_string();

        let mut cleaner = ammonia::Builder::default();
        let cleaner = cleaner.url_relative(ammonia::UrlRelative::Deny);
        let sanitized = cleaner.clean(&payload.html).to_string();
        let html = sanitized.replace('\'', "''");
        let title = payload.title.replace("'", "''");
        let plain = payload.plain.trim().replace("'", "''");

        let og = match &payload.og {
            Some(og) => og.to_owned(),
            None => "".to_owned(),
        };

        let beginning = create_beginning(&plain);

        info!("{}: {} ({})", ulid, payload.title, payload.url);

        self.db.execute(state_add(
            &ulid,
            &payload.url,
            &title,
            &html,
            &og,
            &plain,
            &beginning,
        ))?;

        //add to schema
        self.add_to_index(&ulid, &payload.title, &payload.plain)?;
        Ok(())
    }

    pub async fn delete(&self, id: &str) -> Result<(), HmstrError> {
        self.db.execute(state_delete(id))?;
        info!("DELETED: {}", id);
        self.delete_from_index(id)?;
        info!("DELETED FROM INEX: {}", id);
        Ok(())
    }

    pub async fn read(&self, id: &str) -> Result<Json<ArticleContent>, HmstrError> {
        let mut article = ArticleContent::new();
        self.db.iterate(state_read(id), |pairs| {
            for &(column, value) in pairs.iter() {
                match column {
                    "id" => article.id = value.unwrap().to_owned(),
                    "url" => article.url = value.unwrap().to_owned(),
                    "title" => article.title = value.unwrap().to_owned(),
                    "html" => article.html = value.unwrap().to_owned(),
                    "plain" => article.plain = value.unwrap().to_owned(),
                    "position" => article.position = value.unwrap().parse().unwrap(),
                    "progress" => article.progress = value.unwrap().parse().unwrap(),
                    "archived" => {
                        article.archived = if value.unwrap() == "0" { false } else { true }
                    }
                    "liked" => article.liked = if value.unwrap() == "0" { false } else { true },
                    "timestamp" => article.timestamp = value.unwrap().parse().unwrap(),
                    _ => {}
                }
            }
            true
        })?;
        Ok(Json(article))
    }

    pub async fn search(&self, query: &str) -> Result<Json<Vec<ArticleData>>, HmstrError> {
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
        let found = searcher.search(&queries, &TopDocs::with_limit(SEARCH_LIMIT))?;

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
            self.db.iterate(state_read(&id), |pairs| {
                for &(column, value) in pairs.iter() {
                    match column {
                        "id" => article.id = value.unwrap().to_owned(),
                        "url" => article.url = value.unwrap().to_owned(),
                        "title" => article.title = value.unwrap().to_owned(),
                        "beginning" => article.beginning = value.unwrap().to_owned(),
                        "og" => article.og = value.unwrap().to_owned(),
                        "progress" => article.progress = value.unwrap().parse().unwrap(),
                        "archived" => {
                            article.archived = if value.unwrap() == "0" { false } else { true }
                        }
                        "liked" => article.liked = if value.unwrap() == "0" { false } else { true },
                        "timestamp" => article.timestamp = value.unwrap().parse().unwrap(),
                        _ => {}
                    }
                }
                true
            })?;
            articles.push(article);
        }

        //get tags
        for mut article in articles.iter_mut() {
            let mut tags = vec![];
            let id = &article.id;
            self.db.iterate(state_list_tags(&id), |pairs| {
                for &(column, value) in pairs.iter() {
                    match column {
                        "tag" => tags.push(value.unwrap().to_owned()),
                        _ => {}
                    }
                }
                true
            })?;
            article.tags = tags;
        }

        Ok(Json(articles))
    }

    pub async fn update_progress(&self, id: &str, pos: u16, prog: u16) -> Result<(), HmstrError> {
        self.db.execute(state_upgrade_progress(pos, prog, id))?;
        Ok(())
    }

    pub async fn toggle_state(&self, id: &str, toggle: &str) -> Result<(), HmstrError> {
        self.db.execute(state_toggle(toggle, id))?;
        info!("ID {} toggle {}", id, toggle);
        Ok(())
    }

    pub async fn add_tag(&self, id: &str, tag: &str) -> Result<(), HmstrError> {
        if tag.is_empty() {
            Err(HmstrError::Tag("Tag is empty.".to_owned()))
        } else {
            self.db.execute(state_add_tag(id, tag))?;
            info!("Add tag {} to ID {}", tag, id);
            Ok(())
        }
    }

    pub async fn delete_tag(&self, id: &str, tag: &str) -> Result<(), HmstrError> {
        self.db.execute(state_delete_tag(id, tag))?;
        info!("Delete tag {} of ID {}", tag, id);
        Ok(())
    }
    //add to schema
    fn add_to_index(&self, ulid: &str, title: &str, plain: &str) -> Result<(), HmstrError> {
        let mut index_writer = self.index.writer(50_000_000)?;
        let schema_id = self.schema.get_field("id").unwrap();
        let schema_title = self.schema.get_field("title").unwrap();
        let schema_plain = self.schema.get_field("plain").unwrap();
        index_writer.add_document(tantivy::doc!(
            schema_id => ulid,
            schema_title => title,
            schema_plain => plain
        ))?;
        index_writer.commit()?;
        drop(index_writer);
        Ok(())
    }

    fn delete_from_index(&self, id: &str) -> Result<(), HmstrError> {
        let mut index_writer = self.index.writer(50_000_000)?;
        let schema_id = self.schema.get_field("id").unwrap();
        let term = Term::from_field_text(schema_id, id);
        index_writer.delete_term(term);
        index_writer.commit()?;
        drop(index_writer);
        Ok(())
    }

    pub async fn health(&self) -> String {
        "Hello, world.".to_string()
    }
}

fn create_beginning(s: &str) -> String {
    let mut result = String::new();
    let mut len = 0;
    let mut whitespace_flag = false;
    for c in s.chars() {
        if c.is_whitespace() && whitespace_flag {
            continue;
        }
        if c.is_whitespace() {
            whitespace_flag = true;
        } else {
            whitespace_flag = false;
        }
        result.push(c);
        if let Some(w) = unicode_width::UnicodeWidthChar::width(c) {
            len += w;
        }
        if len >= BEGINNING_LENGTH {
            break;
        } else {
            continue;
        }
    }
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
