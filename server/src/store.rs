use super::error::Error;
use tracing::error;

const DATA_PATH: &str = "./databases/.store";

pub fn create_row(id: &str, title: &str, text: &str) -> Result<(), Error> {
    let store_path = std::path::Path::new("./databases/.store");
    if !store_path.exists() {
        std::fs::create_dir_all(store_path)?;
    }

    let content = format!("title: {}\n{}", title, text);

    std::fs::write(format!("./databases/.store/{}", id), content)?;

    Ok(())
}

pub fn search_store(q: &str) -> Result<Vec<String>, Error> {
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
