use serde::Serialize;

#[derive(Serialize)]
pub struct Hello<'a> {
    pub name: &'a str,
}

#[derive(Serialize)]
pub struct Article {
    pub title: String,
    pub url: String,
    pub html: String,
}

impl Article {
    pub fn new() -> Article {
        Article {
            title: "".to_owned(),
            url: "".to_owned(),
            html: "".to_owned(),
        }
    }
}
