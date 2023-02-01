use reqwest::header::{self, HeaderMap};
use serde::{Deserialize, Serialize};

#[tokio::main]
async fn main() {
    let args = std::env::args();
    if args.len() == 1 {
        let mut rdr = csv::Reader::from_path("instapaper-export.csv").unwrap();
        let mut i: usize = 0;
        for result in rdr.deserialize() {
            let article: Article = result.unwrap();
            println!("{:#?}", article);
            let req = Req {
                url: article.url.to_owned(),
            };
            let j = serde_json::to_string(&req).unwrap();
            let mut headers = HeaderMap::new();
            headers.insert(
                "Content-Type",
                header::HeaderValue::from_str("application/json").unwrap(),
            );
            let client = reqwest::Client::builder()
                .default_headers(headers)
                .build()
                .unwrap();
            let _res = client
                .post("http://localhost:3000/api/create")
                .body(j)
                .send()
                .await
                .unwrap();
            i += 1;
            if i == 1 {
                break;
            }
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct Article {
    #[serde(rename = "URL")]
    url: String,
    #[serde(rename = "Title")]
    title: String,
    #[serde(rename = "Selection")]
    selection: String,
    #[serde(rename = "Folder")]
    folder: String,
    #[serde(rename = "Timestamp")]
    timestamp: usize,
}

#[derive(Debug, Serialize, Deserialize)]
struct Req {
    url: String,
}
