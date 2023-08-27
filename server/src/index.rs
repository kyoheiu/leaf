use super::error::Error;
use super::types::ArticleContent;
use tracing::{error, info};

const DATA_PATH: &str = "./databases/.index";

pub fn create_index(id: &str, title: &str, text: &str) -> Result<(), Error> {
    let index_path = std::path::Path::new(DATA_PATH);
    if !index_path.exists() {
        std::fs::create_dir_all(index_path)?;
    }

    let content = format!("title: {}\n{}", title, text);

    std::fs::write(format!("{}/{}", DATA_PATH, id), content)?;
    info!("CREATED: search index of {}", id);

    Ok(())
}

pub fn delete_index(id: &str) {
    if let Err(e) = std::fs::remove_file(format!("{}/{}", DATA_PATH, id)) {
        error!("Error: {}\nFailed to delete index of {}", e, id);
    } else {
        info!("DELETED: search index of {}", id);
    }
}

pub fn refresh_index(articles: &[ArticleContent]) -> Result<(), Error> {
    let index_path = std::path::Path::new(DATA_PATH);
    if index_path.exists() {
        std::fs::remove_dir_all(index_path)?;
        info!("REFRESH: Removed old index.");
    }
    std::fs::create_dir_all(index_path)?;

    for article in articles {
        let re = regex::Regex::new(r"<[^>]*>").unwrap();
        let plain = re.replace_all(&article.html, "").to_string();
        create_index(&article.id, &article.title, &plain)?;
    }
    Ok(())
}

pub fn search_index(q: &str) -> Result<Vec<String>, Error> {
    let mut result = Vec::new();

    //exec ripgrep
    if let Ok(output) = std::process::Command::new("rg")
        .arg("-l")
        .arg("-i")
        .arg(q)
        .arg(DATA_PATH)
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
