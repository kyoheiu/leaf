use super::error::Error;
use super::handler::*;
use super::statements::*;
use super::types::ArticleScraped;
use super::types::{ArticleContent, ArticleData, Articles};

use axum::Json;
use axum::{
    routing::{get, post},
    Router,
};
use std::path::PathBuf;
use std::{net::TcpListener, sync::Arc};
use tower_http::cors::{Any, CorsLayer};
use tracing::{error, info};

const BEGINNING_LENGTH: usize = 100;
const CHUNK_LENGTH: usize = 21;

pub struct Core {
    pub db: sqlite::ConnectionWithFullMutex,
    pub index: String,
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
        .route("/export", get(export))
        .route("/migrate", post(migrate))
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
    pub fn new() -> Result<Core, Error> {
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

        let index = std::env::var("INDEX_PATH").unwrap_or("./databases/.index".to_string());

        Ok(Core {
            db: connection,
            index,
        })
    }

    pub async fn list_up(&self, statement: &str) -> Result<Json<Articles>, Error> {
        let mut articles = vec![];
        self.db.iterate(statement, |pairs| {
            let mut article = ArticleData::new();
            for &(column, value) in pairs.iter() {
                match column {
                    "id" => article.id = value.unwrap().to_owned(),
                    "title" => article.title = value.unwrap().to_owned(),
                    "url" => article.url = value.unwrap().to_owned(),
                    "cover" => article.cover = value.unwrap().to_owned(),
                    "beginning" => article.beginning = value.unwrap().to_owned(),
                    "progress" => article.progress = value.unwrap().parse().unwrap(),
                    "archived" => article.archived = value.unwrap() != "0",
                    "liked" => article.liked = value.unwrap() != "0",
                    "timestamp" => article.timestamp = value.unwrap().to_owned(),
                    "tag" => article.tags.push(value.unwrap().to_owned()),
                    _ => {}
                }
            }
            articles.push(article);
            true
        })?;

        //get tags
        for article in articles.iter_mut() {
            let mut tags = vec![];
            let id = &article.id;
            self.db.iterate(state_list_tags(id), |pairs| {
                for &(column, value) in pairs.iter() {
                    if column == "tag" {
                        tags.push(value.unwrap().to_owned());
                    }
                }
                true
            })?;
            article.tags = tags;
        }

        if articles.len() == CHUNK_LENGTH {
            articles.pop();
            Ok(Json(Articles {
                data: articles,
                is_last: false,
            }))
        } else {
            Ok(Json(Articles {
                data: articles,
                is_last: true,
            }))
        }
    }

    pub async fn create(&self, scraped: &ArticleScraped) -> Result<(), Error> {
        let ulid = ulid::Ulid::new().to_string();

        let mut cleaner = ammonia::Builder::default();
        let cleaner = cleaner.url_relative(ammonia::UrlRelative::Deny);
        let mut html = cleaner.clean(&scraped.html).to_string();

        let re = regex::Regex::new(r"<[^>]*>").unwrap();
        let plain = re.replace_all(&html, "").to_string();

        let beginning = create_beginning(&plain).replace('\'', "''");
        html = html.replace('\'', "''");
        let title = &scraped.title.replace('\'', "''");

        self.create_index(&ulid, title, &plain)?;

        info!("CREATED {}: {} ({})", ulid, scraped.title, scraped.url);

        self.db.execute(state_add(
            &ulid,
            &scraped.url,
            title,
            &html,
            &scraped.cover,
            &beginning,
        ))?;

        Ok(())
    }

    pub async fn delete(&self, id: &str) -> Result<(), Error> {
        self.db.execute(state_delete(id))?;
        info!("DELETED: {}", id);
        self.delete_index(id);
        Ok(())
    }

    pub async fn read(&self, id: &str) -> Result<Json<ArticleContent>, Error> {
        let mut article = ArticleContent::new();
        self.db.iterate(state_read(id), |pairs| {
            for &(column, value) in pairs.iter() {
                match column {
                    "id" => article.id = value.unwrap().to_owned(),
                    "url" => article.url = value.unwrap().to_owned(),
                    "title" => article.title = value.unwrap().to_owned(),
                    "html" => article.html = value.unwrap().to_owned(),
                    "position" => article.position = value.unwrap().parse().unwrap(),
                    "progress" => article.progress = value.unwrap().parse().unwrap(),
                    "archived" => article.archived = value.unwrap() != "0",
                    "liked" => article.liked = value.unwrap() != "0",
                    "timestamp" => article.timestamp = value.unwrap().parse().unwrap(),
                    _ => {}
                }
            }
            true
        })?;

        //get tags
        let mut tags = vec![];
        self.db.iterate(state_list_tags(id), |pairs| {
            for &(column, value) in pairs.iter() {
                if column == "tag" {
                    tags.push(value.unwrap().to_owned());
                }
            }
            true
        })?;
        article.tags = tags;

        Ok(Json(article))
    }

    pub async fn search(&self, query: &str) -> Result<Json<Vec<ArticleData>>, Error> {
        //Currently single pattern is supported.
        let q = query.split_whitespace().next().unwrap();
        info!("query: {:?}", q);
        let search_result = self.search_index(q)?;

        let mut articles = vec![];
        for id in search_result {
            let mut article = ArticleData::new();
            self.db.iterate(state_read(&id), |pairs| {
                for &(column, value) in pairs.iter() {
                    match column {
                        "id" => article.id = value.unwrap().to_owned(),
                        "url" => article.url = value.unwrap().to_owned(),
                        "title" => article.title = value.unwrap().to_owned(),
                        "beginning" => article.beginning = value.unwrap().to_owned(),
                        "cover" => article.cover = value.unwrap().to_owned(),
                        "progress" => article.progress = value.unwrap().parse().unwrap(),
                        "archived" => article.archived = value.unwrap() != "0",
                        "liked" => article.liked = value.unwrap() != "0",
                        "timestamp" => article.timestamp = value.unwrap().parse().unwrap(),
                        _ => {}
                    }
                }
                true
            })?;
            articles.push(article);
        }

        //get tags
        for article in articles.iter_mut() {
            let mut tags = vec![];
            let id = &article.id;
            self.db.iterate(state_list_tags(id), |pairs| {
                for &(column, value) in pairs.iter() {
                    if column == "tag" {
                        tags.push(value.unwrap().to_owned());
                    }
                }
                true
            })?;
            article.tags = tags;
        }

        Ok(Json(articles))
    }

    pub async fn update_progress(&self, id: &str, pos: u16, prog: u16) -> Result<(), Error> {
        self.db.execute(state_upgrade_progress(pos, prog, id))?;
        Ok(())
    }

    pub async fn toggle_state(&self, id: &str, toggle: &str) -> Result<(), Error> {
        self.db.execute(state_toggle(toggle, id))?;
        info!("TOGGLED: {} of ID {}", toggle, id);
        Ok(())
    }

    pub async fn add_tag(&self, id: &str, tag: &str) -> Result<(), Error> {
        if tag.is_empty() {
            Err(Error::Tag("Tag is empty.".to_owned()))
        } else {
            self.db.execute(state_add_tag(id, tag))?;
            info!("ADDED TAG: {} to ID {}", tag, id);
            Ok(())
        }
    }

    pub async fn delete_tag(&self, id: &str, tag: &str) -> Result<(), Error> {
        self.db.execute(state_delete_tag(id, tag))?;
        info!("DELETED TAG: {} of ID {}", tag, id);
        Ok(())
    }

    pub async fn export(&self) -> Result<Json<Vec<ArticleData>>, Error> {
        let mut articles = vec![];
        self.db.iterate(state_list_all(), |pairs| {
            let mut article = ArticleData::new();
            for &(column, value) in pairs.iter() {
                match column {
                    "id" => article.id = value.unwrap().to_owned(),
                    "title" => article.title = value.unwrap().to_owned(),
                    "url" => article.url = value.unwrap().to_owned(),
                    "cover" => article.cover = value.unwrap().to_owned(),
                    "beginning" => article.beginning = value.unwrap().to_owned(),
                    "progress" => article.progress = value.unwrap().parse().unwrap(),
                    "archived" => article.archived = value.unwrap() != "0",
                    "liked" => article.liked = value.unwrap() != "0",
                    "timestamp" => article.timestamp = value.unwrap().to_owned(),
                    "tag" => article.tags.push(value.unwrap().to_owned()),
                    _ => {}
                }
            }
            articles.push(article);
            true
        })?;

        //get tags
        for article in articles.iter_mut() {
            let mut tags = vec![];
            let id = &article.id;
            self.db.iterate(state_list_tags(id), |pairs| {
                for &(column, value) in pairs.iter() {
                    if column == "tag" {
                        tags.push(value.unwrap().to_owned());
                    }
                }
                true
            })?;
            article.tags = tags;
        }
        Ok(Json(articles))
    }

    pub fn create_index(&self, id: &str, title: &str, text: &str) -> Result<(), Error> {
        let p = std::path::Path::new(&self.index);
        if !p.exists() {
            std::fs::create_dir_all(p)?;
        }

        let content = format!("title: {}\n{}", title, text);

        std::fs::write(format!("{}/{}", &self.index, id), content)?;
        info!("CREATED: search index of {}", id);

        Ok(())
    }

    pub fn delete_index(&self, id: &str) {
        if let Err(e) = std::fs::remove_file(format!("{}/{}", &self.index, id)) {
            error!("Error: {}\nFailed to delete index of {}", e, id);
        } else {
            info!("DELETED: search index of {}", id);
        }
    }

    pub fn refresh_index(&self, articles: &[ArticleContent]) -> Result<(), Error> {
        let p = std::path::Path::new(&self.index);
        if p.exists() {
            std::fs::remove_dir_all(p)?;
            info!("REFRESH: Removed old index.");
        }
        std::fs::create_dir_all(&self.index)?;

        for article in articles {
            let re = regex::Regex::new(r"<[^>]*>").unwrap();
            let plain = re.replace_all(&article.html, "").to_string();
            self.create_index(&article.id, &article.title, &plain)?;
        }
        Ok(())
    }

    pub fn search_index(&self, q: &str) -> Result<Vec<String>, Error> {
        let mut result = Vec::new();

        //exec ripgrep
        if let Ok(output) = std::process::Command::new("rg")
            .arg("-l")
            .arg("-i")
            .arg(q)
            .arg(&self.index)
            .output()
        {
            let output = String::from_utf8(output.stdout)?;
            for item in output.lines() {
                if let Some(file_path) = item.lines().next() {
                    if let Some(file_name) = file_path.split('/').last() {
                        result.push(file_name.to_string());
                    }
                }
            }
        } else {
            error!("ripgrep did not work successfully.");
            return Err(Error::Grep);
        }

        result.sort_by(|a, b| b.partial_cmp(a).unwrap());

        Ok(result)
    }
    pub async fn migrate(&self) -> Result<(), Error> {
        info!("MIGRATE: Started.");
        let mut articles = vec![];
        self.db.iterate(state_list_all(), |pairs| {
            let mut article = ArticleContent::new();
            for &(column, value) in pairs.iter() {
                match column {
                    "id" => article.id = value.unwrap().to_owned(),
                    "title" => article.title = value.unwrap().to_owned(),
                    "html" => article.html = value.unwrap().to_owned(),
                    _ => {}
                }
            }
            articles.push(article);
            true
        })?;
        info!("{:?}", articles);

        self.refresh_index(&articles)?;

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
            result.push(' ');
        } else {
            whitespace_flag = false;
            result.push(c);
        }
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
        assert_eq!(body, "Hello, world.");
    }

    #[tokio::test]
    async fn test_create() {
        let core = Core::new().unwrap();
        let router = router(core);

        let response = router
            .oneshot(
                Request::builder()
                    .method(Method::POST)
                    .uri("/articles")
                    .body(Body::from("https://example.com"))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
