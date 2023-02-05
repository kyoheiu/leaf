use reqwest::header::{self, HeaderMap};
use serde::{Deserialize, Serialize};

#[tokio::main]
async fn main() {
    let mut args = std::env::args();
    let mut rdr = csv::Reader::from_path("instapaper-export.csv").unwrap();
    if args.len() == 1 {
        let mut i: usize = 0;
        for result in rdr.deserialize() {
            let article: Article = result.unwrap();
            send_req(article).await;
            i += 1;
            if i == 1 {
                break;
            }
        }
    } else if args.len() == 2 {
        let number = args.nth(1).unwrap();
        let limit: usize = number.parse::<usize>().unwrap();
        let mut urls = vec![];
        for (index, result) in rdr.deserialize().enumerate() {
            let article: Article = result.unwrap();
            urls.push(article.url);
            if index == limit {
                break;
            }
        }
        send_multiple_req(urls).await;
    }
}

async fn send_multiple_req(urls: Vec<String>) {
    let req = Reqs { url: urls };
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
        .post("http://localhost:3000/api/create_all")
        .body(j)
        .send()
        .await
        .unwrap();
}

async fn send_req(article: Article) {
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

#[derive(Debug, Serialize, Deserialize)]
struct Reqs {
    url: Vec<String>,
}
