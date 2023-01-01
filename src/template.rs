use serde::Serialize;

#[derive(Serialize)]
pub struct Hello<'a> {
    pub name: &'a str,
}
