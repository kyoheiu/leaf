use std::path::PathBuf;

use tantivy::schema::*;
use tantivy::Index;
use tantivy::IndexReader;
use tantivy::ReloadPolicy;

pub fn initialize_schema() -> (Schema, Index, IndexReader) {
    let search_path = match std::env::var("SEARCH_PATH") {
        Ok(p) => PathBuf::from(&p),
        Err(_) => PathBuf::from("./databases/.search"),
    };
    if !search_path.exists() {
        std::fs::create_dir(&search_path).unwrap();
    }

    let mut schema_builder = Schema::builder();
    schema_builder.add_text_field("id", STRING | STORED);
    schema_builder.add_text_field("title", TEXT | STORED);
    schema_builder.add_text_field("plain", TEXT);
    let schema = schema_builder.build();

    let meta_file = search_path.join("meta.json");
    if meta_file.exists() {
        let index = Index::open_in_dir(&search_path).unwrap_or_else(|_| panic!("Cannot open dir."));
        let reader = index
            .reader_builder()
            .reload_policy(ReloadPolicy::OnCommit)
            .try_into()
            .unwrap_or_else(|_| panic!("Cannot read dir."));
        (schema, index, reader)
    } else {
        let index = Index::create_in_dir(&search_path, schema.clone()).unwrap();
        let reader = index
            .reader_builder()
            .reload_policy(ReloadPolicy::OnCommit)
            .try_into()
            .unwrap();
        (schema, index, reader)
    }
}
