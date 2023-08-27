use super::error::Error;
use tracing::{error, info};

const DATA_PATH: &str = "./databases/.store";

pub fn create_index(id: &str, title: &str, text: &str) -> Result<(), Error> {
    let store_path = std::path::Path::new("./databases/.store");
    if !store_path.exists() {
        std::fs::create_dir_all(store_path)?;
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
