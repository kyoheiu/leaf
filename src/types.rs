use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ArticleData {
    pub id: String,
    pub url: String,
    pub title: String,
    pub beginning: String,
    pub progress: u16,
    pub timestamp: String,
}

impl ArticleData {
    pub fn new() -> ArticleData {
        ArticleData {
            id: "".to_owned(),
            url: "".to_owned(),
            title: "".to_owned(),
            beginning: "".to_owned(),
            progress: 0,
            timestamp: "".to_owned(),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ArticleContent {
    pub id: String,
    pub url: String,
    pub title: String,
    pub html: String,
    pub plain: String,
    pub position: u16,
    pub progress: u16,
    pub timestamp: String,
}

impl ArticleContent {
    pub fn new() -> ArticleContent {
        ArticleContent {
            id: "".to_owned(),
            url: "".to_owned(),
            title: "".to_owned(),
            html: "".to_owned(),
            plain: "".to_owned(),
            position: 0,
            progress: 0,
            timestamp: "".to_owned(),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct Articles {
    pub articles: Vec<ArticleData>,
}
