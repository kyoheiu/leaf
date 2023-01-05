use serde::Serialize;

#[derive(Serialize)]
pub struct Hello<'a> {
    pub name: &'a str,
}

#[derive(Debug, Serialize)]
pub struct Article {
    pub id: String,
    pub url: String,
    pub title: String,
    pub html: String,
    pub plain: String,
    pub position: u8,
    pub timestamp: String,
}

impl Article {
    pub fn new() -> Article {
        Article {
            id: "".to_owned(),
            url: "".to_owned(),
            title: "".to_owned(),
            html: "".to_owned(),
            plain: "".to_owned(),
            position: 0,
            timestamp: "".to_owned(),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct Articles {
    pub articles: Vec<Article>,
}
