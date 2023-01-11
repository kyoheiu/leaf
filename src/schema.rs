use tantivy::collector::TopDocs;
use tantivy::query::QueryParser;
use tantivy::schema::*;
use tantivy::Index;
use tantivy::ReloadPolicy;

pub fn initialize_schema() -> (Schema, Index) {
    let search_dir = std::path::PathBuf::from(".search_dir");
    if !search_dir.exists() {
        std::fs::create_dir(".search_dir").unwrap();
    }

    let mut schema_builder = Schema::builder();
    schema_builder.add_text_field("id", TEXT | STORED);
    schema_builder.add_text_field("title", TEXT | STORED);
    schema_builder.add_text_field("plain", TEXT);
    let schema = schema_builder.build();

    let meta_file = std::path::PathBuf::from(".search_dir/meta.json");
    if meta_file.exists() {
        (schema, Index::open_in_dir(&search_dir).unwrap())
    } else {
        let index = Index::create_in_dir(&search_dir, schema.clone()).unwrap();
        (schema, index)
    }
}
